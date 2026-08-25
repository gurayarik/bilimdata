export interface Review {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  author?: { full_name: string | null } | null;
}

export interface ReviewSummary {
  average: number;
  count: number;
}
