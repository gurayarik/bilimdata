import { Injectable } from '@angular/core';
import { QuizBlockSummary, QuizDetail, QuizResult } from '../models/quiz.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class QuizService {
  constructor(private readonly api: ApiService) {}

  listBlocks(slug: string) {
    return this.api.get<QuizBlockSummary[]>(`/courses/${slug}/quizzes`);
  }

  getQuiz(slug: string, blockIndex: number) {
    return this.api.get<QuizDetail>(`/courses/${slug}/quizzes/${blockIndex}`);
  }

  submit(slug: string, blockIndex: number, answers: number[]) {
    return this.api.post<QuizResult>(`/courses/${slug}/quizzes/${blockIndex}/submit`, { answers });
  }
}
