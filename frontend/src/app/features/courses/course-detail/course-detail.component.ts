import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ChatMessage } from '../../../core/models/chat.model';
import { Course } from '../../../core/models/course.model';
import { CurriculumSection } from '../../../core/models/lesson.model';
import { Review, ReviewSummary } from '../../../core/models/review.model';
import { ChatService } from '../../../core/services/chat.service';
import { CourseService } from '../../../core/services/course.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { ReviewService } from '../../../core/services/review.service';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [RouterLink, AsyncPipe, TranslatePipe, FormsModule],
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

          <div class="mt-10">
            <h2 class="text-lg font-bold text-brand-900">
              Değerlendirmeler
              @if (reviewSummary.count) {
                <span class="ml-2 text-sm font-normal text-slate-500">
                  ⭐ {{ reviewSummary.average }} ({{ reviewSummary.count }})
                </span>
              }
            </h2>

            @if (isEnrolled) {
              <form
                class="mt-4 flex flex-col gap-2 rounded-lg border border-slate-200 p-4"
                (ngSubmit)="submitReview()"
              >
                <div class="flex items-center gap-1">
                  @for (star of [1, 2, 3, 4, 5]; track star) {
                    <button type="button" class="text-xl leading-none" (click)="reviewForm.rating = star">
                      {{ star <= reviewForm.rating ? '⭐' : '☆' }}
                    </button>
                  }
                </div>
                <textarea
                  class="rounded-md border border-slate-300 px-3 py-2 text-sm"
                  rows="3"
                  [(ngModel)]="reviewForm.comment"
                  name="comment"
                  placeholder="Yorumunuz (opsiyonel)"
                ></textarea>
                <button
                  type="submit"
                  [disabled]="!reviewForm.rating"
                  class="self-start rounded-md bg-accent-500 px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-accent-600 disabled:opacity-50"
                >
                  Gönder
                </button>
              </form>
            }

            <ul class="mt-4 flex flex-col gap-3">
              @for (review of reviews; track review.id) {
                <li class="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-semibold text-brand-900">
                      {{ review.author?.full_name || 'Kullanıcı' }}
                    </span>
                    <span class="text-sm">{{ stars(review.rating) }}</span>
                  </div>
                  @if (review.comment) {
                    <p class="mt-1 text-sm text-slate-700">{{ review.comment }}</p>
                  }
                </li>
              }
            </ul>
          </div>
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

          @if (session$ | async) {
            <div class="mt-6 flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
              <div class="flex items-center gap-3 bg-gradient-to-r from-brand-900 to-brand-800 px-4 py-3 text-white">
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-lg">
                  🤖
                </span>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-bold leading-tight">Kurs Asistanı</p>
                  <p class="text-xs text-white/60">Müfredat hakkında soru sor</p>
                </div>
                <span class="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[11px] font-medium text-white/80">
                  {{ remainingMessages }}/40
                </span>
              </div>

              <div class="flex max-h-96 flex-col gap-3 overflow-y-auto bg-slate-50/60 p-4">
                @if (!chatMessages.length) {
                  <div class="flex flex-col items-center gap-2 py-6 text-center">
                    <span class="text-3xl">💬</span>
                    <p class="max-w-[220px] text-xs text-slate-500">
                      Bu eğitimin müfredatı, kapsamı veya kime uygun olduğu hakkında soru sorabilirsin.
                    </p>
                  </div>
                }
                @for (msg of chatMessages; track $index) {
                  <div class="flex items-end gap-2" [class.flex-row-reverse]="msg.role === 'user'">
                    <span
                      class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs"
                      [class]="msg.role === 'user' ? 'bg-accent-500/20' : 'bg-brand-900/10'"
                    >
                      {{ msg.role === 'user' ? '🙂' : '🤖' }}
                    </span>
                    @if (msg.role === 'user') {
                      <p class="max-w-[80%] rounded-2xl rounded-br-sm bg-accent-500 px-3.5 py-2 text-sm text-brand-900 shadow-sm">
                        {{ msg.content }}
                      </p>
                    } @else {
                      <div
                        class="rich-content max-w-[80%] rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-700 shadow-sm"
                        [innerHTML]="msg.content"
                      ></div>
                    }
                  </div>
                }
                @if (chatLoading) {
                  <div class="flex items-end gap-2">
                    <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-900/10 text-xs">
                      🤖
                    </span>
                    <span class="rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-400 shadow-sm">
                      Yazıyor…
                    </span>
                  </div>
                }
              </div>

              @if (chatError) {
                <p class="bg-red-50 px-4 py-2 text-xs text-red-600">{{ chatError }}</p>
              }

              <form class="flex items-center gap-2 border-t border-slate-200 bg-white p-3" (ngSubmit)="sendChatMessage()">
                <input
                  class="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm focus:border-accent-500 focus:outline-none"
                  [(ngModel)]="chatInput"
                  name="chatInput"
                  placeholder="Bir soru yaz…"
                  [disabled]="chatLoading || remainingMessages <= 0"
                />
                <button
                  type="submit"
                  class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-500 text-brand-900 hover:bg-accent-600 disabled:opacity-40"
                  [disabled]="chatLoading || !chatInput.trim() || remainingMessages <= 0"
                  aria-label="Gönder"
                >
                  ➤
                </button>
              </form>
            </div>
          } @else {
            <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
              <span class="text-2xl">💬</span>
              <p class="mt-2 text-sm text-slate-500">
                Kurs asistanına soru sorabilmek için
                <a routerLink="/auth/login" class="font-semibold text-brand-900 underline">giriş yap</a>.
              </p>
            </div>
          }
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
  reviews: Review[] = [];
  reviewSummary: ReviewSummary = { average: 0, count: 0 };
  reviewForm: { rating: number; comment: string } = { rating: 0, comment: '' };
  chatMessages: ChatMessage[] = [];
  chatInput = '';
  chatLoading = false;
  chatError = '';
  remainingMessages = 40;
  readonly session$;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly courseService: CourseService,
    private readonly enrollmentService: EnrollmentService,
    private readonly reviewService: ReviewService,
    private readonly chatService: ChatService,
    private readonly translate: TranslateService,
    private readonly supabase: SupabaseService
  ) {
    this.session$ = this.supabase.session$;
  }

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.courseService.getBySlug(slug).subscribe((course) => {
      this.course = course;
      this.refreshEnrollment(course.id);
      this.loadReviews(course.id);
    });
    this.courseService.getCurriculum(slug).subscribe((sections) => (this.sections = sections));
  }

  stars(rating: number) {
    return '⭐'.repeat(rating);
  }

  submitReview() {
    if (!this.course || !this.reviewForm.rating) return;
    this.reviewService
      .submit(this.course.id, this.reviewForm.rating, this.reviewForm.comment)
      .subscribe(() => {
        this.reviewForm = { rating: 0, comment: '' };
        this.loadReviews(this.course!.id);
      });
  }

  sendChatMessage() {
    if (!this.course || !this.chatInput.trim() || this.chatLoading) return;
    const question = this.chatInput.trim();
    const history = [...this.chatMessages];
    this.chatMessages = [...this.chatMessages, { role: 'user', content: question }];
    this.chatInput = '';
    this.chatLoading = true;
    this.chatError = '';
    this.chatService
      .sendMessage(this.course.slug, question, history, this.translate.currentLang() || 'tr')
      .subscribe({
      next: (result) => {
        this.chatLoading = false;
        this.remainingMessages = result.remaining_messages;
        this.chatMessages = [...this.chatMessages, { role: 'assistant', content: result.reply }];
      },
      error: (err: HttpErrorResponse) => {
        this.chatLoading = false;
        this.chatMessages = this.chatMessages.slice(0, -1);
        this.chatError =
          err.status === 429 ? err.error?.detail || 'Günlük soru limitine ulaştın.' : 'Mesaj gönderilemedi, tekrar dener misin?';
      },
    });
  }

  private loadReviews(courseId: string) {
    this.reviewService.listForCourse(courseId).subscribe((reviews) => (this.reviews = reviews));
    this.reviewService.summaryForCourse(courseId).subscribe((summary) => (this.reviewSummary = summary));
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
