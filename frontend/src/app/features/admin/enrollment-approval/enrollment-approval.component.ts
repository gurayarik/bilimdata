import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminEnrollment } from '../../../core/models/admin.model';
import { AdminService } from '../../../core/services/admin.service';
import { AdminNavComponent } from '../shared/admin-nav.component';

@Component({
  selector: 'app-enrollment-approval',
  standalone: true,
  imports: [AdminNavComponent, DatePipe],
  template: `
    <app-admin-nav />
    <section class="mx-auto max-w-3xl px-4 pb-16">
      <h1 class="text-xl font-bold text-brand-900">Kayıt Onayları</h1>
      <p class="mt-2 text-sm text-slate-600">
        Ücretsiz/manuel kayıt talep eden ("free") kayıtlar burada onay bekler.
      </p>

      @if (enrollments.length === 0) {
        <p class="mt-8 text-center text-slate-500">Bekleyen kayıt yok.</p>
      } @else {
        <table class="mt-6 w-full text-left text-sm">
          <thead>
            <tr class="border-b border-slate-200 text-slate-500">
              <th class="py-2">Kullanıcı</th>
              <th>Kurs</th>
              <th>Tarih</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (enrollment of enrollments; track enrollment.id) {
              <tr class="border-b border-slate-100">
                <td class="py-2">{{ enrollment.user?.full_name || enrollment.user_id }}</td>
                <td>{{ enrollment.course?.title || enrollment.course_id }}</td>
                <td>{{ enrollment.enrolled_at | date: 'short' }}</td>
                <td class="text-right">
                  <button
                    type="button"
                    class="rounded-md bg-accent-500 px-3 py-1.5 text-xs font-semibold text-brand-900 hover:bg-accent-600"
                    (click)="approve(enrollment)"
                  >
                    Onayla
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </section>
  `,
})
export class EnrollmentApprovalComponent implements OnInit {
  enrollments: AdminEnrollment[] = [];

  constructor(private readonly adminService: AdminService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.adminService.listPendingEnrollments().subscribe((e) => (this.enrollments = e));
  }

  approve(enrollment: AdminEnrollment) {
    this.adminService.approveEnrollment(enrollment.id).subscribe(() => this.load());
  }
}
