import { useCallback } from "react";
import { supabase } from "../utils/supabase";
import { logger } from "../utils/logger";

export function useFeedbackVotes(userId: string | null) {
  const toggleUpvote = useCallback(async (postId: string, hasUpvoted: boolean) => {
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    try {
      if (hasUpvoted) {
        // Remove upvote
        const { error } = await supabase
          .from('feedback_upvotes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        if (error) {
          logger.error("Error removing upvote:", error);
          return { success: false, error };
        }

        logger.log('[useFeedbackVotes] Removed upvote for post:', postId);
      } else {
        // First check if upvote already exists (race condition protection)
        const { data: existingUpvote } = await supabase
          .from('feedback_upvotes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', userId)
          .maybeSingle();

        if (existingUpvote) {
          // Upvote already exists, just return success
          logger.log('[useFeedbackVotes] Upvote already exists for post:', postId);
          return { success: true };
        }

        // Add upvote
        const { error } = await supabase
          .from('feedback_upvotes')
          .insert({
            post_id: postId,
            user_id: userId,
          });

        if (error) {
          // Check if it's a duplicate key error (23505)
          if (error.code === '23505') {
            // Duplicate key, upvote already exists - this is fine
            logger.log('[useFeedbackVotes] Upvote already exists (duplicate key), ignoring');
            return { success: true };
          }

          logger.error("Error adding upvote:", error);
          return { success: false, error };
        }

        logger.log('[useFeedbackVotes] Added upvote for post:', postId);
      }

      return { success: true };
    } catch (error) {
      logger.error("Error toggling upvote:", error);
      return { success: false, error };
    }
  }, [userId]);

  return {
    toggleUpvote,
  };
}
