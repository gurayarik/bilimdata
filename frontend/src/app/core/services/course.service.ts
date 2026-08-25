import { Injectable } from '@angular/core';
import { Course } from '../models/course.model';
import { CourseProgress } from '../models/course-progress.model';
import { CurriculumSection } from '../models/lesson.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class CourseService {
  constructor(private readonly api: ApiService) {}

  list(categoryId?: string) {
    const query = categoryId ? `?category_id=${categoryId}` : '';
    return this.api.get<Course[]>(`/courses${query}`);
  }

  getBySlug(slug: string) {
    return this.api.get<Course>(`/courses/${slug}`);
  }

  getCurriculum(slug: string) {
    return this.api.get<CurriculumSection[]>(`/courses/${slug}/curriculum`);
  }

  getMyProgress(slug: string) {
    return this.api.get<CourseProgress>(`/courses/${slug}/my-progress`);
  }
}
