import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { instructorGuard } from './core/guards/instructor.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('./features/courses/course-list/course-list.component').then(
        (m) => m.CourseListComponent
      ),
  },
  {
    path: 'deals',
    loadComponent: () => import('./features/deals/deals.component').then((m) => m.DealsComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./features/contact/contact.component').then((m) => m.ContactComponent),
  },
  {
    path: 'privacy',
    loadComponent: () =>
      import('./features/legal/privacy/privacy.component').then((m) => m.PrivacyComponent),
  },
  {
    path: 'terms',
    loadComponent: () => import('./features/legal/terms/terms.component').then((m) => m.TermsComponent),
  },
  {
    path: 'courses/:slug/lessons/:lessonId',
    loadComponent: () =>
      import('./features/courses/course-player/course-player.component').then(
        (m) => m.CoursePlayerComponent
      ),
  },
  {
    path: 'courses/:slug/quizzes/:blockIndex',
    loadComponent: () =>
      import('./features/courses/course-quiz/course-quiz.component').then(
        (m) => m.CourseQuizComponent
      ),
  },
  {
    path: 'courses/:slug',
    loadComponent: () =>
      import('./features/courses/course-detail/course-detail.component').then(
        (m) => m.CourseDetailComponent
      ),
  },
  {
    path: 'blog',
    loadComponent: () =>
      import('./features/blog/blog-list/blog-list.component').then((m) => m.BlogListComponent),
  },
  {
    path: 'blog/write',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/blog/write/write.component').then((m) => m.BlogWriteComponent),
  },
  {
    path: 'blog/:slug',
    loadComponent: () =>
      import('./features/blog/blog-detail/blog-detail.component').then(
        (m) => m.BlogDetailComponent
      ),
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'become-instructor',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/instructor/apply/apply.component').then(
        (m) => m.InstructorApplyComponent
      ),
  },
  {
    path: 'instructor',
    canActivate: [authGuard, instructorGuard],
    loadChildren: () =>
      import('./features/instructor/instructor.routes').then((m) => m.INSTRUCTOR_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
