import { Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslatePipe } from '@ngx-translate/core';
import { CurriculumLesson, CurriculumSection } from '../../../core/models/lesson.model';
import { QuizBlockSummary } from '../../../core/models/quiz.model';
import { CourseService } from '../../../core/services/course.service';
import { LessonService } from '../../../core/services/lesson.service';
import { QuizService } from '../../../core/services/quiz.service';
import { LogoComponent } from '../../../shared/components/logo/logo.component';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiReadyPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (youtubeApiReadyPromise) return youtubeApiReadyPromise;
  youtubeApiReadyPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve();
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(script);
  });
  return youtubeApiReadyPromise;
}

@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [RouterLink, TranslatePipe, LogoComponent],
  template: `
    <section class="bg-slate-50 min-h-screen">
      <div class="mx-auto max-w-6xl px-4 py-8">
        <nav class="mb-6 flex flex-wrap items-center justify-between gap-3">
          <a
            [routerLink]="['/courses', slug]"
            class="group flex items-center gap-2 text-sm font-semibold text-brand-900 transition hover:text-accent-600"
          >
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 transition group-hover:ring-accent-500/50">‹</span>
            {{ courseTitle || ('player.back_to_course' | translate) }}
          </a>
          <div class="flex items-center gap-2">
            @if (totalLessons) {
              <span class="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 sm:text-sm">
                <span class="h-1.5 w-1.5 rounded-full bg-accent-500"></span>
                {{ completedCount }} / {{ totalLessons }} ders · %{{ progressPercent }}
              </span>
            }
            @if (!sidebarOpen) {
              <button
                type="button"
                class="hidden items-center gap-1.5 rounded-full bg-accent-500 px-4 py-1.5 text-xs font-bold text-brand-900 shadow-sm transition hover:bg-accent-600 sm:text-sm md:inline-flex"
                (click)="sidebarOpen = true"
              >
                ☰ {{ 'course_detail.curriculum' | translate }}
              </button>
            }
          </div>
        </nav>

        <div class="grid grid-cols-1 gap-6" [class.md:grid-cols-3]="sidebarOpen">
          <div [class.md:col-span-2]="sidebarOpen">
            @if (videoUrl) {
              <div #videoCard class="group relative rounded-2xl bg-gradient-to-br from-accent-500/70 via-accent-600/25 to-transparent p-[2px] shadow-xl">
                <div class="overflow-hidden rounded-[15px] bg-black">
                  <div class="flex items-center justify-between bg-brand-900 px-4 py-2.5">
                    <app-logo />
                    <button
                      type="button"
                      class="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white/70 transition hover:bg-white/10 hover:text-white sm:text-sm"
                      (click)="toggleFullscreen()"
                    >
                      ⛶ Tam Ekran
                    </button>
                  </div>
                  <div class="h-[3px] w-full bg-gradient-to-r from-accent-500 via-accent-600 to-accent-500"></div>
                  <div class="aspect-video w-full">
                    <iframe
                      id="yt-player"
                      [src]="videoUrl"
                      class="h-full w-full"
                      title="lesson video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen
                    ></iframe>
                  </div>
                </div>
              </div>
              <div class="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
                <h1 class="text-xl font-bold text-brand-900 sm:text-2xl">{{ lessonTitle }}</h1>
                @if (lessonDescription) {
                  <p class="mt-2 text-sm leading-relaxed text-slate-600">{{ lessonDescription }}</p>
                }
                <div class="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
                    [class]="
                      completedLessonIds.has(lessonId)
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                        : 'bg-accent-500 text-brand-900 hover:bg-accent-600'
                    "
                    [disabled]="markingComplete || completedLessonIds.has(lessonId)"
                    (click)="markComplete()"
                  >
                    {{ completedLessonIds.has(lessonId) ? '✅ Tamamlandı' : 'Dersi Tamamladım Olarak İşaretle' }}
                  </button>
                  @if (advancing) {
                    <span class="text-sm text-slate-500">Sonraki derse geçiliyor…</span>
                  }
                  <div class="ml-auto flex gap-2">
                    <button
                      type="button"
                      class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-brand-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                      [disabled]="!previousLesson"
                      (click)="previousLesson && goTo(previousLesson)"
                      aria-label="Önceki ders"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      class="flex h-10 w-10 items-center justify-center rounded-full bg-brand-900 text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-40"
                      [disabled]="!nextLesson"
                      (click)="nextLesson && goTo(nextLesson)"
                      aria-label="Sonraki ders"
                    >
                      ›
                    </button>
                  </div>
                </div>
              </div>
            } @else if (accessError === 401) {
              <div class="flex flex-col items-center gap-3 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
                <span class="flex h-14 w-14 items-center justify-center rounded-full bg-accent-500/10 text-2xl">🔒</span>
                <p class="text-slate-600">{{ 'player.need_login' | translate }}</p>
                <a routerLink="/auth/login" class="mt-2 inline-block rounded-full bg-accent-500 px-6 py-2.5 font-semibold text-brand-900 shadow-sm transition hover:bg-accent-600">
                  {{ 'header.login' | translate }}
                </a>
              </div>
            } @else if (accessError === 403) {
              <div class="flex flex-col items-center gap-3 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
                <span class="flex h-14 w-14 items-center justify-center rounded-full bg-accent-500/10 text-2xl">🔒</span>
                <p class="text-slate-600">{{ 'player.need_enrollment' | translate }}</p>
                <a
                  [routerLink]="['/courses', slug]"
                  class="mt-2 inline-block rounded-full bg-accent-500 px-6 py-2.5 font-semibold text-brand-900 shadow-sm transition hover:bg-accent-600"
                >
                  {{ 'player.back_to_course' | translate }}
                </a>
              </div>
            }
          </div>

          <aside [class.hidden]="!sidebarOpen">
            <div class="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:sticky md:top-20">
              <div class="flex items-center justify-between">
                <h2 class="font-semibold text-brand-900">{{ 'course_detail.curriculum' | translate }}</h2>
                <button
                  type="button"
                  class="hidden items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-accent-500/15 hover:text-accent-600 md:flex"
                  (click)="sidebarOpen = false"
                  aria-label="Müfredatı kapat"
                >
                  Kapat ✕
                </button>
              </div>
              <div class="mt-3 flex items-center gap-2 text-sm text-slate-500">
                <div class="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-accent-500 to-accent-600 transition-all"
                    [style.width.%]="progressPercent"
                  ></div>
                </div>
                <span class="font-semibold text-brand-900">%{{ progressPercent }}</span>
              </div>

              <div class="mt-4 flex flex-col gap-2">
                @for (section of sections; track section.id) {
                  <div
                    class="overflow-hidden rounded-xl transition"
                    [class]="expandedSectionId === section.id ? 'bg-accent-500/5 ring-1 ring-accent-500/20' : 'ring-1 ring-slate-100'"
                  >
                    <button
                      type="button"
                      class="flex w-full items-center justify-between px-3 py-2.5 text-left"
                      (click)="toggleSection(section.id)"
                    >
                      <span class="text-sm font-semibold text-brand-900">{{ section.title }}</span>
                      <span class="flex items-center gap-2 text-xs font-medium text-slate-400">
                        {{ sectionCompletedCount(section) }}/{{ section.lessons.length }}
                        <span
                          class="inline-block transition-transform"
                          [class.rotate-90]="expandedSectionId === section.id"
                        >
                          ›
                        </span>
                      </span>
                    </button>
                    @if (expandedSectionId === section.id) {
                      <ul class="pb-1">
                        @for (lesson of section.lessons; track lesson.id) {
                          <li class="px-2">
                            <a
                              [routerLink]="['/courses', slug, 'lessons', lesson.id]"
                              class="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition"
                              [class]="lesson.id === lessonId ? 'bg-white shadow-sm ring-1 ring-accent-500/30' : 'hover:bg-white/60'"
                            >
                              <span
                                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs"
                                [class]="
                                  completedLessonIds.has(lesson.id)
                                    ? 'bg-emerald-100 text-emerald-600'
                                    : lesson.id === lessonId
                                      ? 'bg-accent-500 text-brand-900'
                                      : lesson.is_preview
                                        ? 'bg-slate-100 text-slate-500'
                                        : 'bg-slate-100 text-slate-400'
                                "
                              >
                                {{ lessonIcon(lesson) }}
                              </span>
                              <span [class.font-semibold]="lesson.id === lessonId" class="min-w-0 flex-1 truncate text-brand-900">
                                {{ lesson.title }}
                              </span>
                              @if (lesson.duration_seconds) {
                                <span class="shrink-0 text-xs text-slate-400">{{ formatDuration(lesson.duration_seconds) }}</span>
                              }
                            </a>
                          </li>
                        }
                      </ul>
                    }
                  </div>
                }
              </div>

              @if (quizBlocks.length) {
                <div class="mt-5 border-t border-slate-100 pt-4">
                  <h2 class="flex items-center gap-1.5 font-semibold text-brand-900">🏆 Sınavlar</h2>
                  <div class="mt-3 flex flex-col gap-2">
                    @for (block of quizBlocks; track block.block_index) {
                      @if (block.unlocked) {
                        <a
                          [routerLink]="['/courses', slug, 'quizzes', block.block_index]"
                          class="flex items-center justify-between rounded-xl bg-accent-500/10 px-3 py-2.5 text-sm font-semibold text-brand-900 ring-1 ring-accent-500/30 transition hover:bg-accent-500/15"
                        >
                          <span>{{ block.title }}</span>
                          @if (block.best_score !== null) {
                            <span class="text-xs font-medium text-slate-500">{{ block.best_score }}/10</span>
                          }
                        </a>
                      } @else {
                        <div class="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-400 ring-1 ring-slate-100">
                          <span>🔒 {{ block.title }}</span>
                          <span class="text-xs">{{ block.total_lessons }} ders</span>
                        </div>
                      }
                    }
                  </div>
                </div>
              }
            </div>
          </aside>
        </div>
      </div>
    </section>
  `,
})
export class CoursePlayerComponent implements OnInit, OnDestroy {
  slug = '';
  lessonId = '';
  lessonTitle = '';
  lessonDescription: string | null = null;
  courseTitle = '';
  videoUrl: SafeResourceUrl | null = null;
  accessError: 401 | 403 | null = null;
  sections: CurriculumSection[] = [];
  progressPercent = 0;
  completedLessonIds = new Set<string>();
  markingComplete = false;
  advancing = false;
  expandedSectionId: string | null = null;
  quizBlocks: QuizBlockSummary[] = [];
  sidebarOpen = true;

  @ViewChild('videoCard') videoCardRef?: ElementRef<HTMLDivElement>;

  private ytPlayer: any = null;
  private progressPoll: ReturnType<typeof setInterval> | null = null;
  private endedHandled = false;
  private loadedCourseSlug = '';
  private readonly isBrowser: boolean;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly courseService: CourseService,
    private readonly lessonService: LessonService,
    private readonly quizService: QuizService,
    private readonly sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.slug = params.get('slug')!;
      this.lessonId = params.get('lessonId')!;
      this.advancing = false;
      this.loadLesson();
      this.courseService.getCurriculum(this.slug).subscribe((sections) => {
        this.sections = sections;
        this.expandActiveSection();
      });
      this.loadProgress();
      this.loadQuizBlocks();
      if (this.loadedCourseSlug !== this.slug) {
        this.loadedCourseSlug = this.slug;
        this.courseService.getBySlug(this.slug).subscribe((course) => (this.courseTitle = course.title));
      }
    });
  }

  private loadQuizBlocks() {
    this.quizService.listBlocks(this.slug).subscribe({
      next: (blocks) => (this.quizBlocks = blocks),
      error: () => {},
    });
  }

  ngOnDestroy() {
    this.destroyPlayer();
  }

  get flatLessons(): CurriculumLesson[] {
    return this.sections.flatMap((section) => section.lessons);
  }

  get totalLessons(): number {
    return this.flatLessons.length;
  }

  get completedCount(): number {
    return this.flatLessons.filter((lesson) => this.completedLessonIds.has(lesson.id)).length;
  }

  get previousLesson(): CurriculumLesson | null {
    const flat = this.flatLessons;
    const index = flat.findIndex((lesson) => lesson.id === this.lessonId);
    return index > 0 ? flat[index - 1] : null;
  }

  get nextLesson(): CurriculumLesson | null {
    return this.findNextLesson();
  }

  goTo(lesson: CurriculumLesson) {
    this.router.navigate(['/courses', this.slug, 'lessons', lesson.id]);
  }

  toggleFullscreen() {
    if (!this.isBrowser) return;
    const el = this.videoCardRef?.nativeElement;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen();
    }
  }

  toggleSection(sectionId: string) {
    this.expandedSectionId = this.expandedSectionId === sectionId ? null : sectionId;
  }

  private expandActiveSection() {
    const active = this.sections.find((section) => section.lessons.some((lesson) => lesson.id === this.lessonId));
    if (active) {
      this.expandedSectionId = active.id;
    }
  }

  lessonIcon(lesson: CurriculumLesson): string {
    if (this.completedLessonIds.has(lesson.id)) return '✓';
    if (lesson.id === this.lessonId) return '▶';
    return lesson.is_preview ? '▶' : '🔒';
  }

  sectionCompletedCount(section: CurriculumSection): number {
    return section.lessons.filter((lesson) => this.completedLessonIds.has(lesson.id)).length;
  }

  formatDuration(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  private loadProgress() {
    this.courseService.getMyProgress(this.slug).subscribe({
      next: (progress) => {
        this.progressPercent = progress.progress_percent;
        this.completedLessonIds = new Set(progress.completed_lesson_ids);
      },
      error: () => {},
    });
  }

  markComplete() {
    if (!this.lessonId) return;
    this.markingComplete = true;
    this.lessonService.updateProgress(this.lessonId, { completed: true }).subscribe({
      next: (result) => {
        this.markingComplete = false;
        this.progressPercent = result.progress_percent;
        this.completedLessonIds.add(this.lessonId);
        this.loadQuizBlocks();
      },
      error: () => (this.markingComplete = false),
    });
  }

  private loadLesson() {
    this.destroyPlayer();
    this.videoUrl = null;
    this.accessError = null;
    this.lessonService.getById(this.lessonId).subscribe({
      next: (lesson) => {
        this.lessonTitle = lesson.title;
        this.lessonDescription = lesson.description;
        if (lesson.youtube_video_id && this.isBrowser) {
          const origin = encodeURIComponent(window.location.origin);
          this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            `https://www.youtube.com/embed/${lesson.youtube_video_id}?rel=0&modestbranding=1&enablejsapi=1&origin=${origin}`
          );
          const requestedLessonId = this.lessonId;
          // İframe DOM'a yazıldıktan sonra JS API'yi ona bağlıyoruz; API
          // yüklenemese/gecikse bile video zaten düz iframe olarak görünür.
          setTimeout(() => this.attachPlayerApi(requestedLessonId), 0);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.accessError = err.status === 401 ? 401 : 403;
      },
    });
  }

  private attachPlayerApi(requestedLessonId: string) {
    loadYouTubeApi().then(() => {
      // Kullanıcı yüklenme bitmeden başka bir derse geçmiş olabilir.
      if (this.lessonId !== requestedLessonId) return;
      this.destroyPlayer();
      this.endedHandled = false;
      this.ytPlayer = new window.YT.Player('yt-player', {
        events: {
          onReady: () => {
            // "ended" olayı bazı gömülü videolarda (özel/kısıtlı paylaşım
            // izinleri) güvenilir tetiklenmeyebiliyor; bu yüzden video
            // süresinin sonuna yaklaşıldığını da periyodik olarak kontrol
            // ederek tamamlanmayı yedekli şekilde algılıyoruz.
            this.progressPoll = setInterval(() => this.checkNearEnd(), 3000);
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              this.onVideoEnded();
            }
          },
        },
      });
    });
  }

  private checkNearEnd() {
    if (!this.ytPlayer || this.endedHandled) return;
    try {
      const duration = this.ytPlayer.getDuration?.();
      const current = this.ytPlayer.getCurrentTime?.();
      if (duration && current && duration - current <= 1.5) {
        this.onVideoEnded();
      }
    } catch {
      // Oynatıcı henüz tam hazır olmayabilir, bir sonraki taramada tekrar denenir.
    }
  }

  private destroyPlayer() {
    if (this.progressPoll) {
      clearInterval(this.progressPoll);
      this.progressPoll = null;
    }
    if (this.ytPlayer) {
      try {
        this.ytPlayer.destroy();
      } catch {
        // iframe zaten kaldırılmış olabilir.
      }
      this.ytPlayer = null;
    }
  }

  private onVideoEnded() {
    if (this.endedHandled) return;
    this.endedHandled = true;
    this.markComplete();
    const next = this.findNextLesson();
    if (!next) return;
    this.advancing = true;
    setTimeout(() => {
      this.router.navigate(['/courses', this.slug, 'lessons', next.id]);
    }, 1500);
  }

  private findNextLesson(): CurriculumLesson | null {
    const flat = this.flatLessons;
    const index = flat.findIndex((lesson) => lesson.id === this.lessonId);
    if (index === -1 || index === flat.length - 1) return null;
    return flat[index + 1];
  }
}
