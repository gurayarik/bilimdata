import { Injectable } from '@angular/core';
import { BlogPost } from '../models/blog.model';
import {
  AdminCourse,
  AdminEnrollment,
  AdminInstructor,
  AdminInstructorApplication,
  AdminSection,
} from '../models/admin.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private readonly api: ApiService) {}

  // Kurslar
  listCourses() {
    return this.api.get<AdminCourse[]>('/admin/courses');
  }
  createCourse(payload: Partial<AdminCourse>) {
    return this.api.post<AdminCourse>('/admin/courses', payload);
  }
  updateCourse(id: string, payload: Partial<AdminCourse>) {
    return this.api.put<AdminCourse>(`/admin/courses/${id}`, payload);
  }
  deleteCourse(id: string) {
    return this.api.delete<{ ok: boolean }>(`/admin/courses/${id}`);
  }

  // Bölümler
  listSections(courseId: string) {
    return this.api.get<AdminSection[]>(`/admin/courses/${courseId}/sections`);
  }
  createSection(courseId: string, payload: { title: string; order_index: number }) {
    return this.api.post<AdminSection>(`/admin/courses/${courseId}/sections`, payload);
  }
  deleteSection(id: string) {
    return this.api.delete<{ ok: boolean }>(`/admin/sections/${id}`);
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
    return this.api.post(`/admin/sections/${sectionId}/lessons`, payload);
  }
  deleteLesson(id: string) {
    return this.api.delete<{ ok: boolean }>(`/admin/lessons/${id}`);
  }

  // Blog
  listBlogPosts() {
    return this.api.get<BlogPost[]>('/admin/blog');
  }
  createBlogPost(payload: Partial<BlogPost>) {
    return this.api.post<BlogPost>('/admin/blog', payload);
  }
  updateBlogPost(id: string, payload: Partial<BlogPost>) {
    return this.api.put<BlogPost>(`/admin/blog/${id}`, payload);
  }
  deleteBlogPost(id: string) {
    return this.api.delete<{ ok: boolean }>(`/admin/blog/${id}`);
  }

  // Eğitmenler
  listInstructors() {
    return this.api.get<AdminInstructor[]>('/admin/instructors');
  }

  // Enrollment onayı
  listPendingEnrollments() {
    return this.api.get<AdminEnrollment[]>('/admin/enrollments/pending');
  }
  approveEnrollment(id: string) {
    return this.api.put(`/admin/enrollments/${id}/approve`, {});
  }

  // Eğitmen başvuruları
  listInstructorApplications() {
    return this.api.get<AdminInstructorApplication[]>('/admin/instructor-applications');
  }
  approveInstructorApplication(id: string) {
    return this.api.put<{ ok: boolean; reminder: string; user_email: string | null }>(
      `/admin/instructor-applications/${id}/approve`,
      {}
    );
  }
  rejectInstructorApplication(id: string) {
    return this.api.put(`/admin/instructor-applications/${id}/reject`, {});
  }
}
