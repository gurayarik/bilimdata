import { Routes } from '@angular/router';

export const INSTRUCTOR_ROUTES: Routes = [
  {
    path: 'courses',
    loadComponent: () =>
      import('./my-courses/my-courses.component').then((m) => m.InstructorMyCoursesComponent),
  },
  {
    path: 'lessons',
    loadComponent: () =>
      import('./my-lessons/my-lessons.component').then((m) => m.InstructorMyLessonsComponent),
  },
  { path: '', redirectTo: 'courses', pathMatch: 'full' },
];
