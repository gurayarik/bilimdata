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
    <section class="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <app-admin-nav />

      <div>
        <h2 class="text-lg font-bold text-brand-900">Kayıt Onayları</h2>
        <p class="mt-1 text-sm text-slate-500">
          Ücretli bir kursa kayıt olup ödemesi henüz doğrulanmamış ("pending") kayıtlar burada onay bekler —
          {{ enrollments.length }} bekleyen. Ücretsiz kurslara kayıtlar anında onaysız aktif olur.
        </p>
      </div>

      @if (enrollments.length === 0) {
        <div class="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 py-16 text-center">
          <span class="text-4xl">✅</span>
          <p class="text-sm text-slate-500">Bekleyen kayıt yok.</p>
        </div>
      } @else {
        <div class="mt-6 flex flex-col gap-3">
          @for (enrollment of enrollments; track enrollment.id) {
            <div
              class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-accent-500/10 text-lg font-bold text-brand-900">
                  {{ (enrollment.user?.full_name || '?').charAt(0).toUpperCase() }}
                </div>
                <div>
                  <p class="font-semibold text-brand-900">{{ enrollment.user?.full_name || enrollment.user_id }}</p>
                  <p class="mt-0.5 text-sm text-slate-500">{{ enrollment.course?.title || enrollment.course_id }}</p>
                  <p class="mt-0.5 text-xs text-slate-400">{{ enrollment.enrolled_at | date: 'short' }}</p>
                </div>
              </div>
              <button
                type="button"
                class="rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-accent-600"
                (click)="approve(enrollment)"
              >
                Onayla
              </button>
            </div>
          }
        </div>
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
