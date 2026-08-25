import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';

type AdminTab = { path: string; label: string; icon: string; badge?: number };

@Component({
  selector: 'app-admin-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div
      class="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 to-brand-800 px-6 py-7 text-white shadow-md sm:px-8"
    >
      <div class="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent-500/20 blur-3xl"></div>
      <div class="relative">
        <p class="text-xs font-semibold uppercase tracking-wide text-white/60">Yönetim</p>
        <h1 class="mt-1 text-xl font-bold sm:text-2xl">Admin Paneli</h1>
      </div>
      <nav class="relative mt-6 flex flex-wrap gap-2">
        @for (tab of tabs; track tab.path) {
          <a
            [routerLink]="tab.path"
            routerLinkActive
            #rla="routerLinkActive"
            [class]="
              rla.isActive
                ? 'flex items-center gap-2 rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-brand-900 shadow'
                : 'flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20'
            "
          >
            <span>{{ tab.icon }}</span>
            {{ tab.label }}
            @if (tab.badge) {
              <span class="rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold leading-none text-white">{{
                tab.badge
              }}</span>
            }
          </a>
        }
      </nav>
    </div>
  `,
})
export class AdminNavComponent implements OnInit {
  pendingEnrollments = 0;
  pendingApplications = 0;
  newContactMessages = 0;

  constructor(private readonly adminService: AdminService) {}

  ngOnInit() {
    this.adminService.listPendingEnrollments().subscribe((list) => (this.pendingEnrollments = list.length));
    this.adminService
      .listInstructorApplications()
      .subscribe((list) => (this.pendingApplications = list.length));
    this.adminService
      .listContactMessages('new')
      .subscribe((list) => (this.newContactMessages = list.length));
  }

  get tabs(): AdminTab[] {
    return [
      { path: '/admin/courses', label: 'Kurslar', icon: '📚' },
      { path: '/admin/lessons', label: 'Dersler', icon: '🎬' },
      { path: '/admin/blog', label: 'Blog', icon: '📝' },
      { path: '/admin/enrollments', label: 'Kayıt Onayları', icon: '✅', badge: this.pendingEnrollments || undefined },
      {
        path: '/admin/instructor-applications',
        label: 'Eğitmen Başvuruları',
        icon: '🎓',
        badge: this.pendingApplications || undefined,
      },
      {
        path: '/admin/contact-messages',
        label: 'İletişim',
        icon: '📬',
        badge: this.newContactMessages || undefined,
      },
    ];
  }
}
