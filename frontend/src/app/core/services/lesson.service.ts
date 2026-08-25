import { Injectable } from '@angular/core';
import { LessonDetail } from '../models/lesson.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class LessonService {
  constructor(private readonly api: ApiService) {}

  getById(lessonId: string) {
    return this.api.get<LessonDetail>(`/lessons/${lessonId}`);
  }

  updateProgress(lessonId: string, payload: { completed: boolean; last_watched_second?: number }) {
    return this.api.post<{ progress_percent: number }>(`/lessons/${lessonId}/progress`, payload);
  }
}
