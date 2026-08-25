export interface QuizBlockSummary {
  block_index: number;
  title: string;
  total_lessons: number;
  unlocked: boolean;
  generated: boolean;
  best_score: number | null;
  attempts_count: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface QuizDetail {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

export interface QuizResultItem {
  question_id: string;
  question: string;
  options: string[];
  correct_index: number;
  selected_index: number;
  correct: boolean;
}

export interface QuizResult {
  score: number;
  total: number;
  results: QuizResultItem[];
}
