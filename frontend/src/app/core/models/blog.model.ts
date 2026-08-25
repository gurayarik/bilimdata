export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
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
