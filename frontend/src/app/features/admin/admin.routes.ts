import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'courses',
    loadComponent: () =>
      import('./course-editor/course-editor.component').then((m) => m.CourseEditorComponent),
  },
  {
    path: 'lessons',
    loadComponent: () =>
      import('./lesson-editor/lesson-editor.component').then((m) => m.LessonEditorComponent),
  },
  {
    path: 'blog',
    loadComponent: () =>
      import('./blog-editor/blog-editor.component').then((m) => m.BlogEditorComponent),
  },
  {
    path: 'enrollments',
    loadComponent: () =>
      import('./enrollment-approval/enrollment-approval.component').then(
        (m) => m.EnrollmentApprovalComponent
      ),
  },
  {
    path: 'instructor-applications',
    loadComponent: () =>
      import('./instructor-applications/instructor-applications.component').then(
        (m) => m.AdminInstructorApplicationsComponent
      ),
  },
  { path: '', redirectTo: 'courses', pathMatch: 'full' },
];
