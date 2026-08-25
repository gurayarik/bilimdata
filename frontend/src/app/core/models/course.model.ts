export interface Instructor {
  id: string;
  title: string | null;
  bio: string | null;
  avatar_url: string | null;
}

export interface Course {
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
  instructor: Instructor | null;
  provider: 'internal' | 'external';
  platform_name: string | null;
  external_url: string | null;
  coupon_code: string | null;
}
