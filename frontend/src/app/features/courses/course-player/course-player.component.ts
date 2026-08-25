import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslatePipe } from '@ngx-translate/core';
import { CurriculumSection } from '../../../core/models/lesson.model';
import { CourseService } from '../../../core/services/course.service';
import { LessonService } from '../../../core/services/lesson.service';

@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <section class="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-3">
      <div class="md:col-span-2">
        @if (videoUrl) {
          <div class="aspect-video w-full overflow-hidden rounded-lg bg-black">
            <iframe
              [src]="videoUrl"
              class="h-full w-full"
              title="lesson video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
          <h1 class="mt-4 text-xl font-bold text-brand-900">{{ lessonTitle }}</h1>
          @if (lessonDescription) {
            <p class="mt-2 text-sm text-slate-600">{{ lessonDescription }}</p>
          }
          <button
            type="button"
            class="mt-4 rounded-md border border-accent-500 px-4 py-2 text-sm font-semibold text-accent-600 hover:bg-accent-500/10 disabled:opacity-50"
            [disabled]="markingComplete || completedLessonIds.has(lessonId)"
            (click)="markComplete()"
          >
            {{ completedLessonIds.has(lessonId) ? '✅ Tamamlandı' : 'Dersi Tamamladım Olarak İşaretle' }}
          </button>
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
export class CoursePlayerComponent implements OnInit {
  slug = '';
  lessonId = '';
  lessonTitle = '';
  lessonDescription: string | null = null;
  videoUrl: SafeResourceUrl | null = null;
  accessError: 401 | 403 | null = null;
  sections: CurriculumSection[] = [];
  progressPercent = 0;
  completedLessonIds = new Set<string>();
  markingComplete = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly courseService: CourseService,
    private readonly lessonService: LessonService,
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.slug = params.get('slug')!;
      this.lessonId = params.get('lessonId')!;
      this.loadLesson();
      this.courseService.getCurriculum(this.slug).subscribe((sections) => (this.sections = sections));
      this.loadProgress();
    });
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
    this.videoUrl = null;
    this.accessError = null;
    this.lessonService.getById(this.lessonId).subscribe({
      next: (lesson) => {
        this.lessonTitle = lesson.title;
        this.lessonDescription = lesson.description;
        if (lesson.youtube_video_id) {
          this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            `https://www.youtube.com/embed/${lesson.youtube_video_id}?rel=0&modestbranding=1`
          );
        }
      },
      error: (err: HttpErrorResponse) => {
        this.accessError = err.status === 401 ? 401 : 403;
      },
    });
  }
}
