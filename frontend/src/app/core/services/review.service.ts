import { Injectable } from '@angular/core';
import { Review, ReviewSummary } from '../models/review.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  constructor(private readonly api: ApiService) {}

  listForCourse(courseId: string) {
    return this.api.get<Review[]>(`/reviews/course/${courseId}`);
  }

  summaryForCourse(courseId: string) {
    return this.api.get<ReviewSummary>(`/reviews/course/${courseId}/summary`);
  }

  submit(courseId: string, rating: number, comment: string) {
    return this.api.post<Review>('/reviews', { course_id: courseId, rating, comment });
  }

  remove(reviewId: string) {
    return this.api.delete<{ ok: boolean }>(`/reviews/${reviewId}`);
  }
}
