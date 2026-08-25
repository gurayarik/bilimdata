import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="mb-6 flex gap-1 border-b border-slate-200">
      <a
        routerLink="/admin/courses"
        routerLinkActive="border-brand-900 text-brand-900"
        class="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-slate-500 hover:text-brand-900"
        >Kurslar</a
      >
      <a
        routerLink="/admin/lessons"
        routerLinkActive="border-brand-900 text-brand-900"
        class="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-slate-500 hover:text-brand-900"
        >Dersler</a
      >
      <a
        routerLink="/admin/blog"
        routerLinkActive="border-brand-900 text-brand-900"
        class="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-slate-500 hover:text-brand-900"
        >Blog</a
      >
      <a
        routerLink="/admin/enrollments"
        routerLinkActive="border-brand-900 text-brand-900"
        class="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-slate-500 hover:text-brand-900"
        >Kayıt Onayları</a
      >
      <a
        routerLink="/admin/instructor-applications"
        routerLinkActive="border-brand-900 text-brand-900"
        class="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-slate-500 hover:text-brand-900"
        >Eğitmen Başvuruları</a
      >
    </nav>
  `,
})
export class AdminNavComponent {}
