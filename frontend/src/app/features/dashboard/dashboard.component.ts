import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Certificate } from '../../core/models/certificate.model';
import { Enrollment } from '../../core/models/enrollment.model';
import { CertificateService } from '../../core/services/certificate.service';
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
          <p class="text-sm text-brand-900">Kendi eğitim içeriklerinizi platformumuzda yayınlamak ister misiniz?</p>
          <a routerLink="/become-instructor" class="mt-2 inline-block text-sm font-semibold text-brand-900 underline">
            Eğitmen Ol →
          </a>
        </div>
      } @else if (profile?.role === 'instructor') {
        <div class="mt-6 rounded-md border border-slate-200 px-4 py-3">
          <a routerLink="/instructor/courses" class="text-sm font-semibold text-brand-900 hover:underline">
            Eğitmen Panelim →
          </a>
        </div>
      }

      @if (activeEnrollments.length) {
        <div class="mt-10">
          <h2 class="text-lg font-bold text-brand-900">Eğitimlerim</h2>
          <div class="mt-4 flex flex-col gap-3">
            @for (enrollment of activeEnrollments; track enrollment.id) {
              <div class="rounded-lg border border-slate-200 p-4">
                <div class="flex items-center justify-between gap-4">
                  <a
                    [routerLink]="['/courses', enrollment.course?.slug]"
                    class="font-semibold text-brand-900 hover:underline"
                  >
                    {{ enrollment.course?.title || 'Eğitim' }}
                  </a>
                  <span class="shrink-0 text-sm text-slate-500">%{{ enrollment.progress_percent }}</span>
                </div>
                <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div class="h-full bg-accent-500" [style.width.%]="enrollment.progress_percent"></div>
                </div>
                <div class="mt-3">
                  @if (certificateUrl(enrollment.course_id); as pdfUrl) {
                    <a
                      [href]="pdfUrl"
                      target="_blank"
                      rel="noopener"
                      class="text-sm font-semibold text-accent-600 underline"
                    >
                      🎓 Sertifikayı Görüntüle
                    </a>
                  } @else if (enrollment.progress_percent >= 100) {
                    <button
                      type="button"
                      class="text-sm font-semibold text-accent-600 underline"
                      (click)="issueCertificate(enrollment.course_id)"
                    >
                      🎓 Sertifika Al
                    </button>
                  }
                </div>
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

  constructor(
    private readonly profileService: ProfileService,
    private readonly supabase: SupabaseService,
    private readonly enrollmentService: EnrollmentService,
    private readonly certificateService: CertificateService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.profileService.getMine().subscribe((profile) => (this.profile = profile));
    this.enrollmentService.mine().subscribe((enrollments) => {
      this.activeEnrollments = enrollments.filter((e) => e.payment_status !== 'pending');
    });
    this.certificateService.mine().subscribe((certificates) => (this.certificates = certificates));
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

  async signOut() {
    await this.supabase.signOut();
    this.router.navigateByUrl('/');
  }
}
