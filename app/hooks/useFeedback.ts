import { useState, useEffect, useCallback } from "react";
import { supabase, sharedSupabase } from "../utils/supabase";
import { logger } from "../utils/logger";
import { FeedbackPost } from "../types/feedback";
import { isDeveloper } from "../utils/constants";

export function useFeedback(userId: string | null, userEmail: string | null) {
  const [posts, setPosts] = useState<FeedbackPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      logger.log('[useFeedback] Loading feedback posts');

      // Fetch all feedback posts sorted by upvote count DESC
      const { data: postsData, error: postsError } = await supabase
        .from('feedback_posts')
        .select('*')
        .order('upvote_count', { ascending: false })
        .order('created_at', { ascending: false });

      if (postsError) {
        logger.error('[useFeedback] Error loading posts:', postsError);
        throw postsError;
      }

      // Enrich posts with user data and upvote status
      const enrichedPosts: FeedbackPost[] = await Promise.all(
        (postsData || []).map(async (post) => {
          // Get user profile from shared_schema - use maybeSingle to avoid errors
          const { data: profile, error: profileError } = await sharedSupabase
            .from('profiles')
            .select('email, first_name, last_name')
            .eq('id', post.user_id)
            .maybeSingle();

          if (profileError) {
            logger.error('[useFeedback] Error fetching profile:', profileError);
          }

          // Check if current user has upvoted this post
          let hasUpvoted = false;
          if (userId) {
            const { data: upvoteData } = await supabase
              .from('feedback_upvotes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', userId)
              .maybeSingle(); // Use maybeSingle() instead of single() to avoid error when no row found
            hasUpvoted = !!upvoteData;
          }

          const userFullName = profile
            ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
            : '';

          // Use full name if available, otherwise email username, or "Użytkownik"
          const displayName = userFullName ||
            (profile?.email ? profile.email.split('@')[0] : null) ||
            'Użytkownik';

          const isAuthor = post.user_id === userId;

          // Debug logging to help identify issues
          if (isAuthor) {
            logger.log('[useFeedback] Post author detected:', { postId: post.id, userId, postUserId: post.user_id });
          }

          return {
            ...post,
            user_email: profile?.email || null,
            user_name: displayName,
            has_upvoted: hasUpvoted,
            is_author: isAuthor,
            is_developer: isDeveloper(profile?.email),
          };
        })
      );

      setPosts(enrichedPosts);
      logger.log('[useFeedback] Loaded', enrichedPosts.length, 'posts');
    } catch (error) {
      logger.error("[useFeedback] Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refreshPosts = useCallback(async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }, [loadPosts]);

  const createPost = useCallback(async (title: string, description: string) => {
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    try {
      const { data: newPost, error } = await supabase
        .from('feedback_posts')
        .insert({
          user_id: userId,
          title: title.trim(),
          description: description.trim(),
        })
        .select()
        .single();

      if (error) {
        logger.error("Error creating post:", error);
        return { success: false, error };
      }

      // Reload posts to get the enriched data
      await loadPosts();

      return { success: true, post: newPost };
    } catch (error) {
      logger.error("Error creating post:", error);
      return { success: false, error };
    }
  }, [userId, loadPosts]);

  const deletePost = useCallback(async (postId: string) => {
    try {
      // Extra validation: Verify user owns the post before attempting delete
      const postToDelete = posts.find(p => p.id === postId);
      if (!postToDelete || postToDelete.user_id !== userId) {
        logger.error('[useFeedback] Unauthorized delete attempt blocked:', {
          postId,
          userId,
          postUserId: postToDelete?.user_id
        });
        return {
          success: false,
          error: { message: 'Unauthorized: You can only delete your own posts' }
        };
      }

      logger.log('[useFeedback] Deleting post:', { postId, userId });

      const { error } = await supabase
        .from('feedback_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', userId); // RLS policy ensures user can only delete own posts

      if (error) {
        logger.error("Error deleting post:", error);
        return { success: false, error };
      }

      setPosts(prev => prev.filter(post => post.id !== postId));
      return { success: true };
    } catch (error) {
      logger.error("Error deleting post:", error);
      return { success: false, error };
    }
  }, [userId, posts]);

  // Real-time subscription for feedback posts and upvotes
  useEffect(() => {
    logger.log('[useFeedback] Setting up real-time subscriptions');

    const feedbackChannel = supabase
      .channel('feedback_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'calcreno_schema',
          table: 'feedback_posts',
        },
        () => {
          logger.log('[useFeedback] Feedback post changed, reloading...');
          loadPosts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'calcreno_schema',
          table: 'feedback_upvotes',
        },
        () => {
          logger.log('[useFeedback] Upvotes changed, reloading...');
          loadPosts();
        }
      )
      .subscribe();

    return () => {
      logger.log('[useFeedback] Cleaning up real-time subscriptions');
      feedbackChannel.unsubscribe();
    };
  }, [loadPosts]);

  // Initial load
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return {
    posts,
    loading,
    refreshing,
    loadPosts,
    refreshPosts,
    createPost,
    deletePost,
  };
}
