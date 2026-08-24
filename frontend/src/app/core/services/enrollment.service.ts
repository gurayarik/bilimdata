import { Injectable } from '@angular/core';
import { Enrollment } from '../models/enrollment.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  constructor(private readonly api: ApiService) {}

  enroll(courseId: string) {
    return this.api.post<Enrollment>('/enrollments', { course_id: courseId });
  }

  mine() {
    return this.api.get<Enrollment[]>('/enrollments/me');
  }
}
