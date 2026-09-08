export type ModerationStatus = 'en_attente' | 'publie' | 'refuse';

export type CommunityPost = {
  id: string;
  created_at: string;
  content: string;
  image_url: string | null;
  is_anonyme: boolean;
  author_name: string | null;
  user_token: string;
  moderation_status?: ModerationStatus | null;
};

export type CommunityComment = {
  id: string;
  created_at: string;
  post_id: string;
  content: string;
  is_anonyme: boolean;
  author_name: string | null;
  user_token: string;
  moderation_status?: ModerationStatus | null;
};

export type CommunityVote = {
  id: string;
  created_at: string;
  post_id: string;
  user_token: string;
  vote_value: 1 | -1;
};

export type VoteRow = {
  post_id: string;
  vote_value: number;
};

export type CommentRow = {
  post_id: string;
  moderation_status?: ModerationStatus | null;
  user_token?: string;
};

export type SelectedImage = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
};
