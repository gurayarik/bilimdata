export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  payment_status: 'pending' | 'paid' | 'free' | 'coupon';
  progress_percent: number;
}
