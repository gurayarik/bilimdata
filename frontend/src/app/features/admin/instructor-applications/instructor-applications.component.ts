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
    <app-admin-nav />
    <section class="mx-auto max-w-3xl px-4 pb-16">
      <h1 class="text-xl font-bold text-brand-900">Eğitmen Başvuruları</h1>

      @if (reminder) {
        <div class="mt-4 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ⚠️ {{ reminder }}
          @if (reminderEmail) {
            <div class="mt-1 font-mono text-xs">{{ reminderEmail }}</div>
          }
        </div>
      }

      @if (applications.length === 0) {
        <p class="mt-8 text-center text-slate-500">Bekleyen başvuru yok.</p>
      } @else {
        <table class="mt-6 w-full text-left text-sm">
          <thead>
            <tr class="border-b border-slate-200 text-slate-500">
              <th class="py-2">Kullanıcı</th>
              <th>Unvan</th>
              <th>Tarih</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (app of applications; track app.id) {
              <tr class="border-b border-slate-100 align-top">
                <td class="py-2">{{ app.applicant?.full_name || app.user_id }}</td>
                <td>{{ app.title || '—' }}</td>
                <td>{{ app.created_at | date: 'short' }}</td>
                <td class="flex gap-2 py-2 text-right">
                  <button
                    type="button"
                    class="rounded-md bg-accent-500 px-3 py-1.5 text-xs font-semibold text-brand-900 hover:bg-accent-600"
                    (click)="approve(app)"
                  >
                    Onayla
                  </button>
                  <button
                    type="button"
                    class="rounded-md border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50"
                    (click)="reject(app)"
                  >
                    Reddet
                  </button>
                </td>
              </tr>
              @if (app.bio) {
                <tr class="border-b border-slate-100">
                  <td colspan="4" class="pb-3 text-xs text-slate-500">{{ app.bio }}</td>
                </tr>
              }
            }
          </tbody>
        </table>
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
