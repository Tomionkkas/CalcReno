import { useState, useEffect, useCallback } from "react";
import { supabase, sharedSupabase } from "../utils/supabase";
import { logger } from "../utils/logger";
import { FeedbackComment, FeedbackPost } from "../types/feedback";
import { isDeveloper } from "../utils/constants";

export function useFeedbackComments(postId: string, userId: string | null, userEmail: string | null) {
  const [comments, setComments] = useState<FeedbackComment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      logger.log('[useFeedbackComments] Loading comments for post:', postId);

      // Fetch all comments for this post
      const { data: commentsData, error } = await supabase
        .from('feedback_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        logger.error('[useFeedbackComments] Error loading comments:', error);
        throw error;
      }

      // Enrich comments with user data
      const enrichedComments: FeedbackComment[] = await Promise.all(
        (commentsData || []).map(async (comment) => {
          // Get user profile from shared_schema - use maybeSingle to avoid errors
          const { data: profile, error: profileError } = await sharedSupabase
            .from('profiles')
            .select('email, first_name, last_name')
            .eq('id', comment.user_id)
            .maybeSingle();

          if (profileError) {
            logger.error('[useFeedbackComments] Error fetching profile:', profileError);
          }

          // Log only if profile is missing (to help debug)
          if (!profile) {
            logger.warn('[useFeedbackComments] No profile found for user:', comment.user_id);
          }

          // Extract name parts, handling null profile
          const firstName = profile?.first_name || '';
          const lastName = profile?.last_name || '';
          const email = profile?.email || '';

          const userFullName = `${firstName} ${lastName}`.trim();

          // PRIORITY: Show full name, then email username, then full email
          let displayName = '';
          let userEmail = email;

          if (userFullName) {
            displayName = userFullName;
          } else if (email) {
            displayName = email.split('@')[0]; // Use email username
          } else {
            // Last resort: fallback to generic name
            logger.warn('[useFeedbackComments] Using fallback name for user:', comment.user_id);
            displayName = 'Użytkownik';
          }

          const isDev = isDeveloper(userEmail);

          return {
            ...comment,
            user_email: userEmail || null,
            user_name: displayName,
            is_author: comment.user_id === userId,
            is_developer: isDev,
          };
        })
      );

      setComments(enrichedComments);
      logger.log('[useFeedbackComments] Loaded', enrichedComments.length, 'comments');
    } catch (error) {
      logger.error("[useFeedbackComments] Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  }, [postId, userId]);

  const addComment = useCallback(async (content: string) => {
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    try {
      const { data: newComment, error } = await supabase
        .from('feedback_comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) {
        logger.error("Error adding comment:", error);
        return { success: false, error };
      }

      // Reload comments to get enriched data
      await loadComments();

      return { success: true, comment: newComment };
    } catch (error) {
      logger.error("Error adding comment:", error);
      return { success: false, error };
    }
  }, [postId, userId, loadComments]);

  const deleteComment = useCallback(async (commentId: string) => {
    try {
      // Extra validation: Verify user owns the comment before attempting delete
      const commentToDelete = comments.find(c => c.id === commentId);
      if (!commentToDelete || commentToDelete.user_id !== userId) {
        logger.error('[useFeedbackComments] Unauthorized comment delete attempt blocked:', {
          commentId,
          userId,
          commentUserId: commentToDelete?.user_id
        });
        return {
          success: false,
          error: { message: 'Unauthorized: You can only delete your own comments' }
        };
      }

      logger.log('[useFeedbackComments] Deleting comment:', { commentId, userId });

      const { error } = await supabase
        .from('feedback_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId); // RLS ensures user can only delete own comments

      if (error) {
        logger.error("Error deleting comment:", error);
        return { success: false, error };
      }

      setComments(prev => prev.filter(comment => comment.id !== commentId));
      return { success: true };
    } catch (error) {
      logger.error("Error deleting comment:", error);
      return { success: false, error };
    }
  }, [userId, comments]);

  /**
   * Check if current user can comment on this post
   * Only the post author and developers can comment
   */
  const canComment = useCallback((post: FeedbackPost): boolean => {
    if (!userId || !userEmail) return false;

    // Developer can always comment
    if (isDeveloper(userEmail)) return true;

    // Post author can comment
    if (post.user_id === userId) return true;

    return false;
  }, [userId, userEmail]);

  // Real-time subscription for comments
  useEffect(() => {
    logger.log('[useFeedbackComments] Setting up real-time subscription for post:', postId);

    const commentsChannel = supabase
      .channel(`comments_${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'calcreno_schema',
          table: 'feedback_comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          logger.log('[useFeedbackComments] Comments changed, reloading...');
          loadComments();
        }
      )
      .subscribe();

    return () => {
      logger.log('[useFeedbackComments] Cleaning up real-time subscription');
      commentsChannel.unsubscribe();
    };
  }, [postId, loadComments]);

  // Initial load
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  return {
    comments,
    loading,
    loadComments,
    addComment,
    deleteComment,
    canComment,
  };
}
