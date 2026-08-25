import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Course } from '../../../core/models/course.model';
import { CurriculumSection } from '../../../core/models/lesson.model';
import { CourseService } from '../../../core/services/course.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [RouterLink, AsyncPipe, TranslatePipe],
  template: `
    @if (course) {
      <section class="bg-brand-900 text-white">
        <div class="mx-auto max-w-5xl px-4 py-12">
          <h1 class="text-2xl font-bold sm:text-3xl">{{ course.title }}</h1>
          @if (course.short_description) {
            <p class="mt-3 max-w-2xl text-white/80">{{ course.short_description }}</p>
          }
          @if (course.instructor) {
            <div class="mt-6 flex items-center gap-3">
              @if (course.instructor.avatar_url) {
                <img
                  [src]="course.instructor.avatar_url"
                  class="h-10 w-10 rounded-full"
                  alt="{{ course.instructor.title }}"
                />
              }
              <span class="text-sm text-white/80">{{ course.instructor.title }}</span>
            </div>
          }
        </div>
      </section>

      <section class="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-3">
        <div class="md:col-span-2">
          @if (course.description) {
            <div>
              <h2 class="text-lg font-bold text-brand-900">
                {{ 'course_detail.about' | translate }}
              </h2>
              <p class="mt-3 whitespace-pre-line text-slate-700">{{ course.description }}</p>
            </div>
          }

          @if (sections.length) {
          <div class="mt-10">
            <h2 class="text-lg font-bold text-brand-900">
              {{ 'course_detail.curriculum' | translate }}
            </h2>
            <div class="mt-4 flex flex-col gap-4">
              @for (section of sections; track section.id) {
                <div class="rounded-lg border border-slate-200">
                  <div class="border-b border-slate-200 bg-slate-50 px-4 py-2 font-semibold text-brand-900">
                    {{ section.title }}
                  </div>
                  <ul>
                    @for (lesson of section.lessons; track lesson.id) {
                      <li class="border-b border-slate-100 px-4 py-2.5 text-sm last:border-b-0">
                        <div class="flex items-center justify-between">
                          @if (canPlay(lesson)) {
                            <a
                              [routerLink]="['/courses', course.slug, 'lessons', lesson.id]"
                              class="flex-1 text-brand-900 hover:text-accent-600"
                            >
                              ▶ {{ lesson.title }}
                            </a>
                          } @else {
                            <span class="flex-1 text-slate-400">🔒 {{ lesson.title }}</span>
                          }
                          @if (lesson.duration_seconds) {
                            <span class="text-slate-400">{{ formatDuration(lesson.duration_seconds) }}</span>
                          }
                        </div>
                        @if (lesson.description) {
                          <p class="mt-1 text-xs text-slate-500">{{ lesson.description }}</p>
                        }
                      </li>
                    }
                  </ul>
                </div>
              }
            </div>
          </div>
          }
        </div>

        <div>
          <div class="rounded-lg border border-slate-200 p-5 shadow-sm">
            @if (course.cover_image_url) {
              <img [src]="course.cover_image_url" class="mb-4 w-full rounded-md" [alt]="course.title" />
            }
            <div class="flex items-baseline gap-2">
              @if (course.discount_price !== null && course.discount_price !== undefined) {
                <span class="text-sm text-slate-400 line-through">{{ course.price }} ₺</span>
                @if (course.discount_price === 0) {
                  <span class="text-xl font-bold text-accent-600">{{ 'course_card.free' | translate }}</span>
                } @else {
                  <span class="text-xl font-bold text-accent-600">{{ course.discount_price }} ₺</span>
                }
              } @else if (course.price === 0) {
                <span class="text-xl font-bold text-accent-600">{{ 'course_card.free' | translate }}</span>
              } @else {
                <span class="text-xl font-bold text-brand-900">{{ course.price }} ₺</span>
              }
            </div>

            @if (course.provider === 'udemy') {
              <a
                [href]="course.external_url"
                target="_blank"
                rel="noopener"
                class="mt-4 block w-full rounded-md bg-accent-500 py-2.5 text-center font-semibold text-brand-900 hover:bg-accent-600"
              >
                {{
                  (isFree(course) ? 'course_detail.free_on_udemy' : 'course_detail.buy_on_udemy')
                    | translate
                }}
              </a>
              @if (course.coupon_code) {
                <p class="mt-2 text-center text-xs text-slate-500">
                  {{ 'course_detail.coupon_note' | translate }}
                </p>
              }
            } @else if (isEnrolled) {
              <p class="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {{ 'course_detail.already_enrolled' | translate }}
              </p>
            } @else if (pendingApproval) {
              <p class="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {{ 'course_detail.pending_approval' | translate }}
              </p>
            } @else if (session$ | async) {
              <button
                type="button"
                class="mt-4 w-full rounded-md bg-accent-500 py-2.5 font-semibold text-brand-900 hover:bg-accent-600"
                [disabled]="enrolling"
                (click)="enroll()"
              >
                {{ 'course_detail.enroll_cta' | translate }}
              </button>
            } @else {
              <a
                routerLink="/auth/login"
                class="mt-4 block w-full rounded-md bg-accent-500 py-2.5 text-center font-semibold text-brand-900 hover:bg-accent-600"
              >
                {{ 'course_detail.login_to_enroll' | translate }}
              </a>
            }
          </div>
        </div>
      </section>
    }
  `,
})
export class CourseDetailComponent implements OnInit {
  course: Course | null = null;
  sections: CurriculumSection[] = [];
  isEnrolled = false;
  pendingApproval = false;
  enrolling = false;
  readonly session$;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly courseService: CourseService,
    private readonly enrollmentService: EnrollmentService,
    private readonly supabase: SupabaseService
  ) {
    this.session$ = this.supabase.session$;
  }

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.courseService.getBySlug(slug).subscribe((course) => {
      this.course = course;
      this.refreshEnrollment(course.id);
    });
    this.courseService.getCurriculum(slug).subscribe((sections) => (this.sections = sections));
  }

  canPlay(lesson: { is_preview: boolean }) {
    return lesson.is_preview || this.isEnrolled;
  }

  isFree(course: Course) {
    const effectivePrice =
      course.discount_price !== null && course.discount_price !== undefined
        ? course.discount_price
        : course.price;
    return effectivePrice === 0;
  }

  enroll() {
    if (!this.course) return;
    this.enrolling = true;
    this.enrollmentService.enroll(this.course.id).subscribe({
      next: (enrollment) => {
        this.enrolling = false;
        this.isEnrolled = enrollment.payment_status !== 'pending';
        this.pendingApproval = enrollment.payment_status === 'pending';
      },
      error: () => (this.enrolling = false),
    });
  }

  formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  private refreshEnrollment(courseId: string) {
    this.supabase.session$.subscribe((session) => {
      if (!session) return;
      this.enrollmentService.mine().subscribe((enrollments) => {
        const mine = enrollments.find((e) => e.course_id === courseId);
        this.isEnrolled = !!mine && mine.payment_status !== 'pending';
        this.pendingApproval = mine?.payment_status === 'pending';
      });
    });
  }
}
