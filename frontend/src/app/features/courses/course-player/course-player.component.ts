import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslatePipe } from '@ngx-translate/core';
import { CurriculumLesson, CurriculumSection } from '../../../core/models/lesson.model';
import { CourseService } from '../../../core/services/course.service';
import { LessonService } from '../../../core/services/lesson.service';

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
    <section class="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-3">
      <div class="md:col-span-2">
        @if (youtubeVideoId) {
          <div class="aspect-video w-full overflow-hidden rounded-lg bg-black">
            <div id="yt-player" class="h-full w-full"></div>
          </div>
          <h1 class="mt-4 text-xl font-bold text-brand-900">{{ lessonTitle }}</h1>
          @if (lessonDescription) {
            <p class="mt-2 text-sm text-slate-600">{{ lessonDescription }}</p>
          }
          <div class="mt-4 flex items-center gap-3">
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

      <div>
        <h2 class="font-semibold text-brand-900">{{ 'course_detail.curriculum' | translate }}</h2>
        <div class="mt-2 flex items-center gap-2 text-sm text-slate-500">
          <div class="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div class="h-full bg-accent-500" [style.width.%]="progressPercent"></div>
          </div>
          <span>%{{ progressPercent }}</span>
        </div>
        <div class="mt-3 flex flex-col gap-3">
          @for (section of sections; track section.id) {
            <div class="rounded-lg border border-slate-200">
              <ul>
                @for (lesson of section.lessons; track lesson.id) {
                  <li
                    class="border-b border-slate-100 px-3 py-2 text-sm last:border-b-0"
                    [class.bg-slate-50]="lesson.id === lessonId"
                  >
                    <a [routerLink]="['/courses', slug, 'lessons', lesson.id]" class="text-brand-900">
                      {{ completedLessonIds.has(lesson.id) ? '✅' : lesson.is_preview ? '▶' : '🔒' }}
                      {{ lesson.title }}
                    </a>
                  </li>
                }
              </ul>
            </div>
          }
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
  youtubeVideoId: string | null = null;
  accessError: 401 | 403 | null = null;
  sections: CurriculumSection[] = [];
  progressPercent = 0;
  completedLessonIds = new Set<string>();
  markingComplete = false;
  advancing = false;

  private ytPlayer: any = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly courseService: CourseService,
    private readonly lessonService: LessonService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.slug = params.get('slug')!;
      this.lessonId = params.get('lessonId')!;
      this.advancing = false;
      this.loadLesson();
      this.courseService.getCurriculum(this.slug).subscribe((sections) => (this.sections = sections));
      this.loadProgress();
    });
  }

  ngOnDestroy() {
    this.destroyPlayer();
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
      },
      error: () => (this.markingComplete = false),
    });
  }

  private loadLesson() {
    this.destroyPlayer();
    this.youtubeVideoId = null;
    this.accessError = null;
    this.lessonService.getById(this.lessonId).subscribe({
      next: (lesson) => {
        this.lessonTitle = lesson.title;
        this.lessonDescription = lesson.description;
        if (lesson.youtube_video_id) {
          this.youtubeVideoId = lesson.youtube_video_id;
          const requestedLessonId = this.lessonId;
          setTimeout(() => this.initPlayer(requestedLessonId, lesson.youtube_video_id!), 0);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.accessError = err.status === 401 ? 401 : 403;
      },
    });
  }

  private initPlayer(requestedLessonId: string, videoId: string) {
    loadYouTubeApi().then(() => {
      // Kullanıcı yüklenme bitmeden başka bir derse geçmiş olabilir.
      if (this.lessonId !== requestedLessonId) return;
      this.destroyPlayer();
      this.ytPlayer = new window.YT.Player('yt-player', {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.ENDED) {
              this.onVideoEnded();
            }
          },
        },
      });
    });
  }

  private destroyPlayer() {
    if (this.ytPlayer) {
      this.ytPlayer.destroy();
      this.ytPlayer = null;
    }
  }

  private onVideoEnded() {
    this.markComplete();
    const next = this.findNextLesson();
    if (!next) return;
    this.advancing = true;
    setTimeout(() => {
      this.router.navigate(['/courses', this.slug, 'lessons', next.id]);
    }, 1500);
  }

  private findNextLesson(): CurriculumLesson | null {
    const flat = this.sections.flatMap((section) => section.lessons);
    const index = flat.findIndex((lesson) => lesson.id === this.lessonId);
    if (index === -1 || index === flat.length - 1) return null;
    return flat[index + 1];
  }
}
