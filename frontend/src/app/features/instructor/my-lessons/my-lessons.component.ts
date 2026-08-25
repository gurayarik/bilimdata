import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AdminCourse, AdminSection, AdminSectionLesson } from '../../../core/models/admin.model';
import { InstructorService } from '../../../core/services/instructor.service';

@Component({
  selector: 'app-instructor-my-lessons',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="mx-auto max-w-4xl px-4 py-10">
      <div class="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 to-brand-800 px-6 py-8 text-white shadow-md sm:px-8">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 class="text-xl font-bold sm:text-2xl">Ders Yönetimi</h1>
            <p class="mt-1 text-sm text-white/70">Bölümleri ve dersleri düzenle</p>
          </div>
          <a
            routerLink="/instructor/courses"
            class="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
          >
            🗂️ Kurslarım
          </a>
        </div>

        <label class="mt-6 flex flex-col gap-1 text-sm">
          <span class="text-white/70">Kurs Seç</span>
          <select
            class="rounded-md border-0 bg-white px-3 py-2 text-slate-900"
            [(ngModel)]="selectedCourseId"
            (ngModelChange)="loadSections()"
          >
            <option [ngValue]="null">— kurs seçin —</option>
            @for (course of courses; track course.id) {
              <option [ngValue]="course.id">{{ course.title }}</option>
            }
          </select>
        </label>
      </div>

      @if (selectedCourseId) {
        <div class="mt-8 flex flex-col gap-5">
          @for (section of sections; track section.id) {
            <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                <span class="font-semibold text-brand-900">{{ section.title }}</span>
                <div class="flex items-center gap-3">
                  <span class="text-xs text-slate-400">{{ section.lessons.length }} ders</span>
                  <button
                    type="button"
                    class="rounded-full border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                    (click)="removeSection(section)"
                  >
                    🗑️ Bölümü Sil
                  </button>
                </div>
              </div>
              <ul>
                @for (lesson of section.lessons; track lesson.id) {
                  <li class="border-b border-slate-100 px-4 py-3 text-sm last:border-b-0">
                    <div class="flex items-center justify-between gap-2">
                      <span class="flex min-w-0 items-center gap-2">
                        <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-900/10 text-xs font-semibold text-brand-900">
                          {{ lesson.order_index }}
                        </span>
                        <span class="truncate">
                          {{ lesson.title }}
                          @if (lesson.is_preview) {
                            <span class="ml-1 rounded-full bg-accent-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-accent-700">
                              Önizleme
                            </span>
                          }
                        </span>
                      </span>
                      <button
                        type="button"
                        class="shrink-0 rounded-full border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                        (click)="removeLesson(section, lesson)"
                      >
                        Sil
                      </button>
                    </div>

                    @if (lesson.resources && lesson.resources.length) {
                      <div class="mt-2 flex flex-wrap gap-2 pl-8">
                        @for (resource of lesson.resources; track $index) {
                          <span class="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs">
                            📎 <a [href]="resource.url" target="_blank" class="hover:underline">{{ resource.name }}</a>
                            <button type="button" class="text-red-500 hover:underline" (click)="removeResource(lesson, $index)">
                              ✕
                            </button>
                          </span>
                        }
                      </div>
                    }

                    <div class="mt-2 pl-8">
                      <input
                        type="file"
                        accept=".pdf,.ppt,.pptx,.key,.odp"
                        class="text-xs text-slate-500"
                        (change)="uploadResource(lesson, $event)"
                      />
                    </div>
                  </li>
                }
              </ul>
              <form
                class="flex flex-wrap items-end gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3"
                (ngSubmit)="addLesson(section)"
              >
                <label class="flex flex-col gap-1 text-xs">
                  Başlık
                  <input
                    class="rounded-md border border-slate-300 px-2 py-1"
                    [(ngModel)]="newLesson[section.id].title"
                    name="title-{{ section.id }}"
                    required
                  />
                </label>
                <label class="flex flex-col gap-1 text-xs">
                  YouTube Video ID
                  <input
                    class="rounded-md border border-slate-300 px-2 py-1"
                    [(ngModel)]="newLesson[section.id].youtube_video_id"
                    name="ytid-{{ section.id }}"
                    required
                  />
                </label>
                <label class="flex flex-col gap-1 text-xs">
                  Sıra
                  <input
                    type="number"
                    class="w-16 rounded-md border border-slate-300 px-2 py-1"
                    [(ngModel)]="newLesson[section.id].order_index"
                    name="order-{{ section.id }}"
                  />
                </label>
                <label class="flex items-center gap-1 text-xs">
                  <input type="checkbox" [(ngModel)]="newLesson[section.id].is_preview" name="preview-{{ section.id }}" />
                  Önizleme
                </label>
                <button
                  type="submit"
                  class="rounded-full bg-accent-500 px-3 py-1.5 text-xs font-semibold text-brand-900 hover:bg-accent-600"
                >
                  + Ders Ekle
                </button>
              </form>
            </div>
          }

          <form class="flex items-end gap-2 rounded-2xl border border-dashed border-slate-300 p-4" (ngSubmit)="addSection()">
            <label class="flex flex-col gap-1 text-sm">
              Yeni Bölüm Başlığı
              <input class="rounded-md border border-slate-300 px-3 py-2" [(ngModel)]="newSectionTitle" name="newSection" />
            </label>
            <button
              type="submit"
              class="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            >
              + Bölüm Ekle
            </button>
          </form>
        </div>
      } @else {
        <div class="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 py-16 text-center">
          <span class="text-4xl">🎬</span>
          <p class="text-sm text-slate-500">Ders eklemek için yukarıdan bir kurs seç.</p>
        </div>
      }
    </section>
  `,
})
export class InstructorMyLessonsComponent implements OnInit {
  courses: AdminCourse[] = [];
  sections: AdminSection[] = [];
  selectedCourseId: string | null = null;
  newSectionTitle = '';
  newLesson: Record<
    string,
    { title: string; youtube_video_id: string; order_index: number; is_preview: boolean }
  > = {};

  constructor(private readonly instructorService: InstructorService) {}

  ngOnInit() {
    this.instructorService.listCourses().subscribe((courses) => (this.courses = courses));
  }

  loadSections() {
    this.sections = [];
    if (!this.selectedCourseId) return;
    this.instructorService.listSections(this.selectedCourseId).subscribe((sections) => {
      this.sections = sections;
      for (const section of sections) {
        this.newLesson[section.id] ??= {
          title: '',
          youtube_video_id: '',
          order_index: section.lessons.length + 1,
          is_preview: false,
        };
      }
    });
  }

  addSection() {
    if (!this.selectedCourseId || !this.newSectionTitle.trim()) return;
    this.instructorService
      .createSection(this.selectedCourseId, {
        title: this.newSectionTitle,
        order_index: this.sections.length + 1,
      })
      .subscribe(() => {
        this.newSectionTitle = '';
        this.loadSections();
      });
  }

  removeSection(section: AdminSection) {
    if (!confirm(`"${section.title}" bölümü (ve içindeki dersler) silinsin mi?`)) return;
    this.instructorService.deleteSection(section.id).subscribe(() => this.loadSections());
  }

  addLesson(section: AdminSection) {
    const draft = this.newLesson[section.id];
    if (!draft?.title || !draft?.youtube_video_id) return;
    this.instructorService.createLesson(section.id, draft).subscribe(() => this.loadSections());
  }

  removeLesson(section: AdminSection, lesson: { id: string; title: string }) {
    if (!confirm(`"${lesson.title}" dersi silinsin mi?`)) return;
    this.instructorService.deleteLesson(lesson.id).subscribe(() => this.loadSections());
  }

  uploadResource(lesson: AdminSectionLesson, event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.instructorService.uploadResource(lesson.id, file).subscribe(() => {
      input.value = '';
      this.loadSections();
    });
  }

  removeResource(lesson: AdminSectionLesson, index: number) {
    this.instructorService.deleteResource(lesson.id, index).subscribe(() => this.loadSections());
  }
}
