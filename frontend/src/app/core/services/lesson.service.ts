import { Injectable } from '@angular/core';
import { LessonDetail } from '../models/lesson.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class LessonService {
  constructor(private readonly api: ApiService) {}

  getById(lessonId: string) {
    return this.api.get<LessonDetail>(`/lessons/${lessonId}`);
  }
}
