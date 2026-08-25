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
    <section class="mx-auto max-w-5xl px-4 py-10">
      <div class="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 to-brand-800 px-6 py-8 text-white shadow-md sm:px-8">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/15 text-lg font-bold">
              {{ initials }}
            </div>
            <div>
              <h1 class="text-xl font-bold sm:text-2xl">{{ 'dashboard.title' | translate }}</h1>
              @if (profile) {
                <p class="mt-1 text-sm text-white/70">
                  {{
                    'dashboard.welcome'
                      | translate: { name: profile.full_name || ('dashboard.welcome_fallback' | translate) }
                  }}
                </p>
              }
            </div>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-full border border-white/30 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
            (click)="signOut()"
          >
            {{ 'dashboard.sign_out' | translate }}
          </button>
        </div>

        @if (profile?.role === 'student') {
          <div class="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/10 px-4 py-3">
            <p class="text-sm text-white/90">{{ 'dashboard.instructor_prompt' | translate }}</p>
            <a
              routerLink="/become-instructor"
              class="shrink-0 rounded-full bg-accent-500 px-4 py-1.5 text-xs font-semibold text-brand-900 hover:bg-accent-600"
            >
              {{ 'dashboard.become_instructor_cta' | translate }}
            </a>
          </div>
        } @else if (profile?.role === 'instructor') {
          <div class="mt-6">
            <a
              routerLink="/instructor/courses"
              class="inline-flex items-center gap-1 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
            >
              {{ 'dashboard.instructor_panel_cta' | translate }}
            </a>
          </div>
        }
      </div>

      @if (activeEnrollments.length) {
        <div class="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div class="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <span class="text-xl">📚</span>
            <p class="mt-1 text-2xl font-bold text-brand-900">{{ activeEnrollments.length }}</p>
            <p class="text-xs text-slate-500">{{ 'dashboard.stat_enrolled' | translate }}</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <span class="text-xl">✅</span>
            <p class="mt-1 text-2xl font-bold text-emerald-600">{{ completedCourses.length }}</p>
            <p class="text-xs text-slate-500">{{ 'dashboard.stat_completed' | translate }}</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <span class="text-xl">📈</span>
            <p class="mt-1 text-2xl font-bold text-accent-600">{{ averageProgress }}%</p>
            <p class="text-xs text-slate-500">{{ 'dashboard.stat_avg_progress' | translate }}</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <span class="text-xl">🎓</span>
            <p class="mt-1 text-2xl font-bold text-brand-900">{{ certificates.length }}</p>
            <p class="text-xs text-slate-500">{{ 'dashboard.stat_certificates' | translate }}</p>
          </div>
        </div>

        @if (completedCourses.length) {
          <div class="mt-8">
            <h2 class="text-lg font-bold text-brand-900">{{ 'dashboard.completed_courses_title' | translate }}</h2>
            <div class="mt-3 flex flex-wrap gap-2">
              @for (enrollment of completedCourses; track enrollment.id) {
                <div class="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 py-1.5 pl-3 pr-2 text-sm">
                  <span class="font-semibold text-brand-900">✅ {{ enrollment.course?.title || ('dashboard.course_fallback' | translate) }}</span>
                  @if (certificateUrl(enrollment.course_id); as pdfUrl) {
                    <a
                      [href]="pdfUrl"
                      target="_blank"
                      rel="noopener"
                      class="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-accent-600 shadow-sm"
                    >
                      🎓 {{ 'dashboard.certificate_short' | translate }}
                    </a>
                  } @else {
                    <button
                      type="button"
                      class="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-accent-600 shadow-sm"
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
          <div class="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            @for (enrollment of activeEnrollments; track enrollment.id) {
              <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                <a [routerLink]="['/courses', enrollment.course?.slug]" class="relative block aspect-video w-full bg-slate-100">
                  @if (enrollment.course?.cover_image_url) {
                    <img
                      [src]="enrollment.course?.cover_image_url"
                      class="h-full w-full object-cover"
                      [alt]="enrollment.course?.title"
                    />
                  } @else {
                    <div class="flex h-full items-center justify-center text-3xl">📘</div>
                  }
                  @if (enrollment.progress_percent >= 100) {
                    <span class="absolute right-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white shadow">
                      ✅ {{ 'dashboard.stat_completed' | translate }}
                    </span>
                  }
                </a>

                <div class="p-4">
                  <a
                    [routerLink]="['/courses', enrollment.course?.slug]"
                    class="font-semibold text-brand-900 hover:text-accent-600"
                  >
                    {{ enrollment.course?.title || ('dashboard.course_fallback' | translate) }}
                  </a>

                  <div class="mt-3 flex items-center gap-2">
                    <div class="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div class="h-full bg-accent-500" [style.width.%]="enrollment.progress_percent"></div>
                    </div>
                    <span class="shrink-0 text-xs font-semibold text-slate-500">%{{ enrollment.progress_percent }}</span>
                  </div>

                  <div class="mt-4 flex flex-wrap items-center gap-2">
                    <a
                      [routerLink]="['/courses', enrollment.course?.slug]"
                      class="rounded-full bg-brand-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-900/90"
                    >
                      {{
                        (enrollment.progress_percent > 0 ? 'dashboard.continue_cta' : 'dashboard.start_cta') | translate
                      }}
                    </a>
                    @if (certificateUrl(enrollment.course_id); as pdfUrl) {
                      <a
                        [href]="pdfUrl"
                        target="_blank"
                        rel="noopener"
                        class="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-accent-600 hover:bg-slate-50"
                      >
                        🎓 {{ 'dashboard.certificate_view' | translate }}
                      </a>
                    } @else if (enrollment.progress_percent >= 100) {
                      <button
                        type="button"
                        class="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-accent-600 hover:bg-slate-50"
                        (click)="issueCertificate(enrollment.course_id)"
                      >
                        🎓 {{ 'dashboard.certificate_get' | translate }}
                      </button>
                    }
                    @if (enrollment.course?.slug) {
                      <button
                        type="button"
                        class="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-brand-900 hover:bg-slate-50 disabled:opacity-50"
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
                      <div
                        class="rich-content text-sm text-slate-700"
                        [innerHTML]="coachMessages[enrollment.course_id]"
                      ></div>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 py-16 text-center">
          <span class="text-4xl">🎒</span>
          <p class="text-sm text-slate-500">{{ 'dashboard.progress_placeholder' | translate }}</p>
          <a
            routerLink="/courses"
            class="rounded-full bg-accent-500 px-5 py-2 text-sm font-semibold text-brand-900 hover:bg-accent-600"
          >
            {{ 'dashboard.browse_courses_cta' | translate }}
          </a>
        </div>
      }
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

  get initials(): string {
    const name = this.profile?.full_name?.trim();
    if (!name) return '👤';
    const parts = name.split(/\s+/).filter(Boolean);
    const letters = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '');
    return letters.join('') || '👤';
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
