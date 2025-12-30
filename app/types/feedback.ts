export interface FeedbackPost {
  id: string;
  user_id: string;
  title: string;
  description: string;
  upvote_count: number;
  comment_count: number;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  // Enriched fields (computed in hooks)
  user_email?: string;
  user_name?: string;
  has_upvoted?: boolean;
  is_author?: boolean;
  is_developer?: boolean;
}

export interface FeedbackComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  // Enriched fields (computed in hooks)
  user_email?: string;
  user_name?: string;
  is_author?: boolean;
  is_developer?: boolean;
}

export interface FeedbackUpvote {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}
