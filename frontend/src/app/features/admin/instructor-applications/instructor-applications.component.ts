import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminInstructorApplication } from '../../../core/models/admin.model';
import { AdminService } from '../../../core/services/admin.service';
import { AdminNavComponent } from '../shared/admin-nav.component';

@Component({
  selector: 'app-admin-instructor-applications',
  standalone: true,
  imports: [AdminNavComponent, DatePipe],
  template: `
    <section class="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <app-admin-nav />

      <div>
        <h2 class="text-lg font-bold text-brand-900">Eğitmen Başvuruları</h2>
        <p class="mt-1 text-sm text-slate-500">{{ applications.length }} bekleyen başvuru</p>
      </div>

      @if (reminder) {
        <div class="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>⚠️</span>
          <div>
            {{ reminder }}
            @if (reminderEmail) {
              <div class="mt-1 font-mono text-xs">{{ reminderEmail }}</div>
            }
          </div>
        </div>
      }

      @if (applications.length === 0) {
        <div class="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 py-16 text-center">
          <span class="text-4xl">🎓</span>
          <p class="text-sm text-slate-500">Bekleyen başvuru yok.</p>
        </div>
      } @else {
        <div class="mt-6 flex flex-col gap-3">
          @for (app of applications; track app.id) {
            <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-12 w-12 items-center justify-center rounded-full bg-accent-500/10 text-lg font-bold text-brand-900"
                  >
                    {{ (app.applicant?.full_name || '?').charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p class="font-semibold text-brand-900">{{ app.applicant?.full_name || app.user_id }}</p>
                    <p class="mt-0.5 text-sm text-slate-500">{{ app.title || 'Unvan belirtilmemiş' }}</p>
                    <p class="mt-0.5 text-xs text-slate-400">{{ app.created_at | date: 'short' }}</p>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-accent-600"
                    (click)="approve(app)"
                  >
                    Onayla
                  </button>
                  <button
                    type="button"
                    class="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                    (click)="reject(app)"
                  >
                    Reddet
                  </button>
                </div>
              </div>
              @if (app.bio) {
                <p class="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600">{{ app.bio }}</p>
              }
            </div>
          }
        </div>
      }
    </section>
  `,
})
export class AdminInstructorApplicationsComponent implements OnInit {
  applications: AdminInstructorApplication[] = [];
  reminder = '';
  reminderEmail: string | null = null;

  constructor(private readonly adminService: AdminService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.adminService
      .listInstructorApplications()
      .subscribe((applications) => (this.applications = applications));
  }

  approve(app: AdminInstructorApplication) {
    this.adminService.approveInstructorApplication(app.id).subscribe((result) => {
      this.reminder = result.reminder;
      this.reminderEmail = result.user_email;
      this.load();
    });
  }

  reject(app: AdminInstructorApplication) {
    if (!confirm('Bu başvuru reddedilsin mi?')) return;
    this.adminService.rejectInstructorApplication(app.id).subscribe(() => this.load());
  }
}
