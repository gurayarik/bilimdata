export interface PathArticleSummary {
  id: string;
  title: string;
  slug: string;
  order_index: number;
}

export interface PathArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  order_index: number;
  ai_generated: boolean;
}

export interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  category_id: string | null;
  articles: PathArticleSummary[];
}

export interface LearningPathDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  category_id: string | null;
  articles: PathArticle[];
}

export interface PathProgress {
  completed_article_ids: string[];
  progress_percent: number;
}

export interface PathMyProgressSummary {
  title: string;
  slug: string;
  cover_image_url: string | null;
  total_articles: number;
  completed_count: number;
  progress_percent: number;
  next_article_slug: string | null;
}
