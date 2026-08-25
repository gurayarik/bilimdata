import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Certificate } from '../../core/models/certificate.model';
import { Enrollment } from '../../core/models/enrollment.model';
import { CertificateService } from '../../core/services/certificate.service';
import { CourseService } from '../../core/services/course.service';
import { EnrollmentService } from '../../core/services/enrollment.service';
import { Profile, ProfileService } from '../../core/services/profile.service';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslatePipe, RouterLink],
  template: `
    <section class="mx-auto max-w-3xl px-4 py-12">
      <h1 class="text-2xl font-bold text-brand-900">{{ 'dashboard.title' | translate }}</h1>
      @if (profile) {
        <p class="mt-2 text-slate-700">
          {{
            'dashboard.welcome'
              | translate: { name: profile.full_name || ('dashboard.welcome_fallback' | translate) }
          }}
        </p>
      }

      @if (profile?.role === 'student') {
        <div class="mt-6 rounded-md border border-accent-500/40 bg-accent-500/10 px-4 py-3">
          <p class="text-sm text-brand-900">{{ 'dashboard.instructor_prompt' | translate }}</p>
          <a routerLink="/become-instructor" class="mt-2 inline-block text-sm font-semibold text-brand-900 underline">
            {{ 'dashboard.become_instructor_cta' | translate }}
          </a>
        </div>
      } @else if (profile?.role === 'instructor') {
        <div class="mt-6 rounded-md border border-slate-200 px-4 py-3">
          <a routerLink="/instructor/courses" class="text-sm font-semibold text-brand-900 hover:underline">
            {{ 'dashboard.instructor_panel_cta' | translate }}
          </a>
        </div>
      }

      @if (activeEnrollments.length) {
        <div class="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div class="rounded-lg border border-slate-200 p-4 text-center">
            <p class="text-2xl font-bold text-brand-900">{{ activeEnrollments.length }}</p>
            <p class="text-xs text-slate-500">{{ 'dashboard.stat_enrolled' | translate }}</p>
          </div>
          <div class="rounded-lg border border-slate-200 p-4 text-center">
            <p class="text-2xl font-bold text-emerald-600">{{ completedCourses.length }}</p>
            <p class="text-xs text-slate-500">{{ 'dashboard.stat_completed' | translate }}</p>
          </div>
          <div class="rounded-lg border border-slate-200 p-4 text-center">
            <p class="text-2xl font-bold text-accent-600">{{ averageProgress }}%</p>
            <p class="text-xs text-slate-500">{{ 'dashboard.stat_avg_progress' | translate }}</p>
          </div>
          <div class="rounded-lg border border-slate-200 p-4 text-center">
            <p class="text-2xl font-bold text-brand-900">{{ certificates.length }}</p>
            <p class="text-xs text-slate-500">{{ 'dashboard.stat_certificates' | translate }}</p>
          </div>
        </div>

        @if (completedCourses.length) {
          <div class="mt-8">
            <h2 class="text-lg font-bold text-brand-900">{{ 'dashboard.completed_courses_title' | translate }}</h2>
            <div class="mt-3 flex flex-col gap-2">
              @for (enrollment of completedCourses; track enrollment.id) {
                <div class="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <span class="text-sm font-semibold text-brand-900">
                    ✅ {{ enrollment.course?.title || ('dashboard.course_fallback' | translate) }}
                  </span>
                  @if (certificateUrl(enrollment.course_id); as pdfUrl) {
                    <a [href]="pdfUrl" target="_blank" rel="noopener" class="text-sm font-semibold text-accent-600 underline">
                      🎓 {{ 'dashboard.certificate_short' | translate }}
                    </a>
                  } @else {
                    <button
                      type="button"
                      class="text-sm font-semibold text-accent-600 underline"
                      (click)="issueCertificate(enrollment.course_id)"
                    >
                      🎓 {{ 'dashboard.certificate_get' | translate }}
                    </button>
                  }
                </div>
              }
            </div>
          </div>
        }

        <div class="mt-10">
          <h2 class="text-lg font-bold text-brand-900">{{ 'dashboard.title' | translate }}</h2>
          <div class="mt-4 flex flex-col gap-3">
            @for (enrollment of activeEnrollments; track enrollment.id) {
              <div class="rounded-lg border border-slate-200 p-4">
                <div class="flex items-center justify-between gap-4">
                  <a
                    [routerLink]="['/courses', enrollment.course?.slug]"
                    class="font-semibold text-brand-900 hover:underline"
                  >
                    {{ enrollment.course?.title || ('dashboard.course_fallback' | translate) }}
                  </a>
                  <span class="shrink-0 text-sm text-slate-500">%{{ enrollment.progress_percent }}</span>
                </div>
                <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div class="h-full bg-accent-500" [style.width.%]="enrollment.progress_percent"></div>
                </div>
                <div class="mt-3 flex flex-wrap items-center gap-3">
                  @if (certificateUrl(enrollment.course_id); as pdfUrl) {
                    <a
                      [href]="pdfUrl"
                      target="_blank"
                      rel="noopener"
                      class="text-sm font-semibold text-accent-600 underline"
                    >
                      🎓 {{ 'dashboard.certificate_view' | translate }}
                    </a>
                  } @else if (enrollment.progress_percent >= 100) {
                    <button
                      type="button"
                      class="text-sm font-semibold text-accent-600 underline"
                      (click)="issueCertificate(enrollment.course_id)"
                    >
                      🎓 {{ 'dashboard.certificate_get' | translate }}
                    </button>
                  }
                  @if (enrollment.course?.slug) {
                    <button
                      type="button"
                      class="text-sm font-semibold text-brand-900 underline disabled:opacity-50"
                      [disabled]="coachLoading[enrollment.course_id]"
                      (click)="toggleCoach(enrollment)"
                    >
                      🤖 {{ (coachOpen[enrollment.course_id] ? 'dashboard.coach_hide' : 'dashboard.coach_show') | translate }}
                    </button>
                  }
                </div>

                @if (coachLoading[enrollment.course_id]) {
                  <p class="mt-3 text-sm text-slate-500">{{ 'dashboard.coach_loading' | translate }}</p>
                } @else if (coachOpen[enrollment.course_id] && coachMessages[enrollment.course_id]) {
                  <div class="coach-message mt-3 rounded-md border border-accent-500/30 bg-accent-500/10 p-4">
                    <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-accent-600">
                      🎯 {{ 'dashboard.coach_label' | translate }}
                    </p>
                    <div class="rich-content text-sm text-slate-700" [innerHTML]="coachMessages[enrollment.course_id]"></div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      } @else {
        <p class="mt-8 text-sm text-slate-500">{{ 'dashboard.progress_placeholder' | translate }}</p>
      }

      <button
        type="button"
        class="mt-10 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-slate-50"
        (click)="signOut()"
      >
        {{ 'dashboard.sign_out' | translate }}
      </button>
    </section>
  `,
})
export class DashboardComponent implements OnInit {
  profile: Profile | null = null;
  activeEnrollments: Enrollment[] = [];
  certificates: Certificate[] = [];
  coachMessages: Record<string, string> = {};
  coachLoading: Record<string, boolean> = {};
  coachOpen: Record<string, boolean> = {};

  constructor(
    private readonly profileService: ProfileService,
    private readonly supabase: SupabaseService,
    private readonly enrollmentService: EnrollmentService,
    private readonly certificateService: CertificateService,
    private readonly courseService: CourseService,
    private readonly translate: TranslateService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.profileService.getMine().subscribe((profile) => (this.profile = profile));
    this.enrollmentService.mine().subscribe((enrollments) => {
      this.activeEnrollments = enrollments.filter((e) => e.payment_status !== 'pending');
    });
    this.certificateService.mine().subscribe((certificates) => (this.certificates = certificates));
  }

  get completedCourses(): Enrollment[] {
    return this.activeEnrollments.filter((e) => e.progress_percent >= 100);
  }

  get averageProgress(): number {
    if (!this.activeEnrollments.length) return 0;
    const total = this.activeEnrollments.reduce((sum, e) => sum + e.progress_percent, 0);
    return Math.round(total / this.activeEnrollments.length);
  }

  certificateUrl(courseId: string): string | null {
    return this.certificates.find((c) => c.course_id === courseId)?.pdf_url ?? null;
  }

  issueCertificate(courseId: string) {
    this.certificateService.issue(courseId).subscribe((result) => {
      this.certificates = [
        ...this.certificates,
        { id: '', user_id: '', course_id: courseId, issued_at: '', pdf_url: result.pdf_url },
      ];
    });
  }

  toggleCoach(enrollment: Enrollment) {
    const courseId = enrollment.course_id;
    const slug = enrollment.course?.slug;
    if (!slug) return;

    if (this.coachMessages[courseId]) {
      this.coachOpen[courseId] = !this.coachOpen[courseId];
      return;
    }

    this.coachLoading = { ...this.coachLoading, [courseId]: true };
    this.courseService.getCoach(slug, this.translate.currentLang() || 'tr').subscribe({
      next: (result) => {
        this.coachLoading = { ...this.coachLoading, [courseId]: false };
        this.coachMessages = { ...this.coachMessages, [courseId]: result.message };
        this.coachOpen = { ...this.coachOpen, [courseId]: true };
      },
      error: () => {
        this.coachLoading = { ...this.coachLoading, [courseId]: false };
      },
    });
  }

  async signOut() {
    await this.supabase.signOut();
    this.router.navigateByUrl('/');
  }
}
