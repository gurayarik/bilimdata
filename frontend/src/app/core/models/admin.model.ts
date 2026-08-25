export interface AdminCourse {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  cover_image_url: string | null;
  category_id: string | null;
  instructor_id: string | null;
  price: number;
  discount_price: number | null;
  level: string | null;
  language: string;
  is_published: boolean;
  provider: 'internal' | 'udemy' | 'external';
  platform_name: string | null;
  external_url: string | null;
  coupon_code: string | null;
  category: { id: string; name: string } | null;
  instructor: { id: string; title: string | null } | null;
}

export interface LessonResource {
  type: 'pdf' | 'slide' | 'file';
  name: string;
  url: string;
}

export interface AdminSectionLesson {
  id: string;
  title: string;
  description: string | null;
  youtube_video_id: string;
  duration_seconds: number | null;
  order_index: number;
  is_preview: boolean;
  resources?: LessonResource[] | null;
}

export interface AdminSection {
  id: string;
  title: string;
  order_index: number;
  lessons: AdminSectionLesson[];
}

export interface AdminInstructor {
  id: string;
  title: string | null;
}

export interface AdminInstructorApplication {
  id: string;
  user_id: string;
  title: string | null;
  bio: string | null;
  status: string;
  created_at: string;
  applicant: { full_name: string | null; avatar_url: string | null } | null;
}

export interface AdminEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  payment_status: string;
  enrolled_at: string;
  course: { title: string } | null;
  user: { full_name: string | null } | null;
}

export interface AdminContactMessage {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: 'new' | 'answered';
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}
