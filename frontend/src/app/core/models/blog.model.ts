export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  video_url: string | null;
  content: string;
  excerpt: string | null;
  ai_summary: string | null;
  author_id: string | null;
  category: string | null;
  tags: string[] | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

export interface BlogComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  author: { full_name: string | null; avatar_url: string | null } | null;
}

export interface BlogLikes {
  count: number;
  liked_by_me: boolean;
}
