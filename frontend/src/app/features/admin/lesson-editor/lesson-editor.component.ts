import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminCourse, AdminSection } from '../../../core/models/admin.model';
import { AdminService } from '../../../core/services/admin.service';
import { AdminNavComponent } from '../shared/admin-nav.component';

@Component({
  selector: 'app-lesson-editor',
  standalone: true,
  imports: [FormsModule, AdminNavComponent],
  template: `
    <section class="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <app-admin-nav />

      <h2 class="text-lg font-bold text-brand-900">Ders Yönetimi</h2>

      <label class="mt-4 flex flex-col gap-1 text-sm">
        Kurs Seç
        <select
          class="rounded-md border border-slate-300 px-3 py-2 sm:max-w-md"
          [(ngModel)]="selectedCourseId"
          (ngModelChange)="loadSections()"
        >
          <option [ngValue]="null">— kurs seçin —</option>
          @for (course of courses; track course.id) {
            <option [ngValue]="course.id">{{ course.title }}</option>
          }
        </select>
      </label>

      @if (selectedCourseId) {
        <div class="mt-6 flex flex-col gap-4">
          @for (section of sections; track section.id) {
            <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                <span class="flex items-center gap-2 font-semibold text-brand-900">
                  📂 {{ section.title }}
                  <span class="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-normal text-slate-600"
                    >{{ section.lessons.length }} ders</span
                  >
                </span>
                <button
                  type="button"
                  class="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                  (click)="removeSection(section)"
                >
                  🗑️ Bölümü Sil
                </button>
              </div>
              <ul>
                @for (lesson of section.lessons; track lesson.id) {
                  <li
                    class="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 text-sm last:border-b-0"
                  >
                    <span class="flex items-center gap-2">
                      <span
                        class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500"
                        >{{ lesson.order_index }}</span
                      >
                      {{ lesson.title }}
                      @if (lesson.is_preview) {
                        <span class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700"
                          >Önizleme</span
                        >
                      }
                      <span class="font-mono text-xs text-slate-400">{{ lesson.youtube_video_id }}</span>
                    </span>
                    <button
                      type="button"
                      class="text-xs font-semibold text-red-600 hover:underline"
                      (click)="removeLesson(section, lesson)"
                    >
                      Sil
                    </button>
                  </li>
                }
              </ul>
              <form
                class="flex flex-wrap items-end gap-2 border-t border-slate-100 bg-slate-50/50 px-4 py-3"
                (ngSubmit)="addLesson(section)"
              >
                <label class="flex flex-col gap-1 text-xs">
                  Başlık
                  <input
                    class="rounded-md border border-slate-300 px-2 py-1.5"
                    [(ngModel)]="newLesson[section.id].title"
                    name="title-{{ section.id }}"
                    required
                  />
                </label>
                <label class="flex flex-col gap-1 text-xs">
                  YouTube Video ID
                  <input
                    class="rounded-md border border-slate-300 px-2 py-1.5"
                    [(ngModel)]="newLesson[section.id].youtube_video_id"
                    name="ytid-{{ section.id }}"
                    required
                  />
                </label>
                <label class="flex flex-col gap-1 text-xs">
                  Sıra
                  <input
                    type="number"
                    class="w-16 rounded-md border border-slate-300 px-2 py-1.5"
                    [(ngModel)]="newLesson[section.id].order_index"
                    name="order-{{ section.id }}"
                  />
                </label>
                <label class="flex items-center gap-1 pb-1.5 text-xs">
                  <input
                    type="checkbox"
                    [(ngModel)]="newLesson[section.id].is_preview"
                    name="preview-{{ section.id }}"
                  />
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

          <form
            class="flex items-end gap-2 rounded-2xl border border-dashed border-slate-300 p-4"
            (ngSubmit)="addSection()"
          >
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
        <div class="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 py-16 text-center">
          <span class="text-4xl">🎬</span>
          <p class="text-sm text-slate-500">Ders eklemek için önce bir kurs seç.</p>
        </div>
      }
    </section>
  `,
})
export class LessonEditorComponent implements OnInit {
  courses: AdminCourse[] = [];
  sections: AdminSection[] = [];
  selectedCourseId: string | null = null;
  newSectionTitle = '';
  newLesson: Record<
    string,
    { title: string; youtube_video_id: string; order_index: number; is_preview: boolean }
  > = {};

  constructor(private readonly adminService: AdminService) {}

  ngOnInit() {
    this.adminService.listCourses().subscribe((courses) => (this.courses = courses));
  }

  loadSections() {
    this.sections = [];
    if (!this.selectedCourseId) return;
    this.adminService.listSections(this.selectedCourseId).subscribe((sections) => {
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
    this.adminService
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
    this.adminService.deleteSection(section.id).subscribe(() => this.loadSections());
  }

  addLesson(section: AdminSection) {
    const draft = this.newLesson[section.id];
    if (!draft?.title || !draft?.youtube_video_id) return;
    this.adminService.createLesson(section.id, draft).subscribe(() => this.loadSections());
  }

  removeLesson(section: AdminSection, lesson: { id: string; title: string }) {
    if (!confirm(`"${lesson.title}" dersi silinsin mi?`)) return;
    this.adminService.deleteLesson(lesson.id).subscribe(() => this.loadSections());
  }
}
