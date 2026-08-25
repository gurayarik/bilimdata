export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  payment_status: 'pending' | 'paid' | 'free' | 'coupon';
  progress_percent: number;
  course?: { title: string; slug: string; cover_image_url: string | null } | null;
}
