export interface CurriculumLesson {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  is_preview: boolean;
  duration_seconds: number | null;
}

export interface CurriculumSection {
  id: string;
  title: string;
  order_index: number;
  lessons: CurriculumLesson[];
}

export interface LessonDetail {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  is_preview: boolean;
  duration_seconds: number | null;
  youtube_video_id: string | null;
}
