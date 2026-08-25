import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslatePipe } from '@ngx-translate/core';
import { CurriculumLesson, CurriculumSection } from '../../../core/models/lesson.model';
import { QuizBlockSummary } from '../../../core/models/quiz.model';
import { CourseService } from '../../../core/services/course.service';
import { LessonService } from '../../../core/services/lesson.service';
import { QuizService } from '../../../core/services/quiz.service';

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
  imports: [RouterLink, TranslatePipe],
  template: `
    <section class="mx-auto max-w-6xl px-4 py-8">
      <nav class="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <a
          [routerLink]="['/courses', slug]"
          class="flex items-center gap-1 text-sm font-semibold text-brand-900 hover:text-accent-600"
        >
          ← {{ courseTitle || ('player.back_to_course' | translate) }}
        </a>
        @if (totalLessons) {
          <span class="text-sm text-slate-500">
            {{ completedCount }} / {{ totalLessons }} ders tamamlandı · %{{ progressPercent }}
          </span>
        }
      </nav>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div class="md:col-span-2">
          @if (videoUrl) {
            <div class="overflow-hidden rounded-lg border border-brand-900/10 shadow-sm">
              <div class="flex items-center justify-between bg-brand-900 px-4 py-2">
                <span class="text-sm font-bold tracking-wide text-white">BilimData</span>
                <span class="h-1 w-10 rounded-full bg-accent-500"></span>
              </div>
              <div class="aspect-video w-full bg-black">
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
            <h1 class="mt-4 text-xl font-bold text-brand-900">{{ lessonTitle }}</h1>
            @if (lessonDescription) {
              <p class="mt-2 text-sm text-slate-600">{{ lessonDescription }}</p>
            }
            <div class="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                class="rounded-md border border-accent-500 px-4 py-2 text-sm font-semibold text-accent-600 hover:bg-accent-500/10 disabled:opacity-50"
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
                  class="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-brand-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  [disabled]="!previousLesson"
                  (click)="previousLesson && goTo(previousLesson)"
                >
                  ‹ Önceki Ders
                </button>
                <button
                  type="button"
                  class="rounded-md bg-brand-900 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-900/90 disabled:cursor-not-allowed disabled:opacity-40"
                  [disabled]="!nextLesson"
                  (click)="nextLesson && goTo(nextLesson)"
                >
                  Sonraki Ders ›
                </button>
              </div>
            </div>
          } @else if (accessError === 401) {
            <div class="rounded-lg border border-slate-200 p-8 text-center">
              <p class="text-slate-600">{{ 'player.need_login' | translate }}</p>
              <a routerLink="/auth/login" class="mt-4 inline-block rounded-md bg-accent-500 px-5 py-2.5 font-semibold text-brand-900 hover:bg-accent-600">
                {{ 'header.login' | translate }}
              </a>
            </div>
          } @else if (accessError === 403) {
            <div class="rounded-lg border border-slate-200 p-8 text-center">
              <p class="text-slate-600">{{ 'player.need_enrollment' | translate }}</p>
              <a
                [routerLink]="['/courses', slug]"
                class="mt-4 inline-block rounded-md bg-accent-500 px-5 py-2.5 font-semibold text-brand-900 hover:bg-accent-600"
              >
                {{ 'player.back_to_course' | translate }}
              </a>
            </div>
          }
        </div>

        <aside>
          <div class="border-b border-slate-200 bg-white pb-3 md:sticky md:top-16 md:z-10">
            <h2 class="font-semibold text-brand-900">{{ 'course_detail.curriculum' | translate }}</h2>
            <div class="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <div class="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div class="h-full bg-accent-500 transition-all" [style.width.%]="progressPercent"></div>
              </div>
              <span>%{{ progressPercent }}</span>
            </div>
          </div>
          <div class="mt-3 flex flex-col gap-3">
            @for (section of sections; track section.id) {
              <div class="overflow-hidden rounded-lg border border-slate-200">
                <button
                  type="button"
                  class="flex w-full items-center justify-between bg-slate-50 px-3 py-2 text-left"
                  [class.border-b]="expandedSectionId === section.id"
                  [class.border-slate-200]="expandedSectionId === section.id"
                  (click)="toggleSection(section.id)"
                >
                  <span class="text-sm font-semibold text-brand-900">{{ section.title }}</span>
                  <span class="flex items-center gap-2 text-xs font-medium text-slate-400">
                    {{ sectionCompletedCount(section) }}/{{ section.lessons.length }}
                    <span class="text-slate-400">{{ expandedSectionId === section.id ? '▾' : '▸' }}</span>
                  </span>
                </button>
                @if (expandedSectionId === section.id) {
                  <ul>
                    @for (lesson of section.lessons; track lesson.id) {
                      <li
                        class="border-b border-l-4 border-slate-100 px-3 py-2 text-sm last:border-b-0"
                        [class]="lesson.id === lessonId ? 'border-l-accent-500 bg-accent-500/10' : 'border-l-transparent'"
                      >
                        <a [routerLink]="['/courses', slug, 'lessons', lesson.id]" class="flex items-center justify-between gap-2 text-brand-900">
                          <span [class.font-semibold]="lesson.id === lessonId" class="min-w-0">
                            {{ lessonIcon(lesson) }} {{ lesson.title }}
                            @if (lesson.id === lessonId) {
                              <span class="ml-1 text-xs font-semibold text-accent-600">(şu an izliyorsun)</span>
                            }
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
            <div class="mt-6">
              <h2 class="font-semibold text-brand-900">🏆 Sınavlar</h2>
              <div class="mt-3 flex flex-col gap-2">
                @for (block of quizBlocks; track block.block_index) {
                  @if (block.unlocked) {
                    <a
                      [routerLink]="['/courses', slug, 'quizzes', block.block_index]"
                      class="flex items-center justify-between rounded-lg border border-accent-500/40 bg-accent-500/10 px-3 py-2 text-sm font-semibold text-brand-900 hover:bg-accent-500/20"
                    >
                      <span>{{ block.title }}</span>
                      @if (block.best_score !== null) {
                        <span class="text-xs font-medium text-slate-500">{{ block.best_score }}/10</span>
                      }
                    </a>
                  } @else {
                    <div class="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-400">
                      <span>🔒 {{ block.title }}</span>
                      <span class="text-xs">{{ block.total_lessons }} ders</span>
                    </div>
                  }
                }
              </div>
            </div>
          }
        </aside>
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

  private ytPlayer: any = null;
  private progressPoll: ReturnType<typeof setInterval> | null = null;
  private endedHandled = false;
  private loadedCourseSlug = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly courseService: CourseService,
    private readonly lessonService: LessonService,
    private readonly quizService: QuizService,
    private readonly sanitizer: DomSanitizer
  ) {}

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
    if (this.completedLessonIds.has(lesson.id)) return '✅';
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
        if (lesson.youtube_video_id) {
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
