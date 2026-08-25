import { Injectable } from '@angular/core';
import { AdminCourse, AdminSection, LessonResource } from '../models/admin.model';
import { InstructorApplication } from '../models/instructor-application.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class InstructorService {
  constructor(private readonly api: ApiService) {}

  // Başvuru
  apply(payload: { title?: string; bio?: string; kvkk_consent: boolean }) {
    return this.api.post<InstructorApplication>('/instructor-applications', payload);
  }
  myApplication() {
    return this.api.get<InstructorApplication | null>('/instructor-applications/me');
  }

  // Kendi kursları
  listCourses() {
    return this.api.get<AdminCourse[]>('/instructor/courses');
  }
  createCourse(payload: Partial<AdminCourse>) {
    return this.api.post<AdminCourse>('/instructor/courses', payload);
  }
  updateCourse(id: string, payload: Partial<AdminCourse>) {
    return this.api.put<AdminCourse>(`/instructor/courses/${id}`, payload);
  }
  deleteCourse(id: string) {
    return this.api.delete<{ ok: boolean }>(`/instructor/courses/${id}`);
  }

  // Bölümler
  listSections(courseId: string) {
    return this.api.get<AdminSection[]>(`/instructor/courses/${courseId}/sections`);
  }
  createSection(courseId: string, payload: { title: string; order_index: number }) {
    return this.api.post<AdminSection>(`/instructor/courses/${courseId}/sections`, payload);
  }
  deleteSection(id: string) {
    return this.api.delete<{ ok: boolean }>(`/instructor/sections/${id}`);
  }

  // Dersler
  createLesson(
    sectionId: string,
    payload: {
      title: string;
      description?: string;
      youtube_video_id: string;
      duration_seconds?: number;
      order_index: number;
      is_preview?: boolean;
    }
  ) {
    return this.api.post(`/instructor/sections/${sectionId}/lessons`, payload);
  }
  deleteLesson(id: string) {
    return this.api.delete<{ ok: boolean }>(`/instructor/lessons/${id}`);
  }

  // Ders kaynakları (PDF/slayt)
  uploadResource(lessonId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<LessonResource>(`/instructor/lessons/${lessonId}/resources`, formData);
  }
  deleteResource(lessonId: string, index: number) {
    return this.api.delete<{ resources: LessonResource[] }>(
      `/instructor/lessons/${lessonId}/resources/${index}`
    );
  }
}
