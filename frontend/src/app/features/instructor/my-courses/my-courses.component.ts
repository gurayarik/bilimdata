import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Category } from '../../../core/models/category.model';
import { AdminCourse } from '../../../core/models/admin.model';
import { CategoryService } from '../../../core/services/category.service';
import { InstructorService } from '../../../core/services/instructor.service';

type CourseForm = Partial<AdminCourse> & { title: string; slug: string; price: number };

function emptyForm(): CourseForm {
  return {
    title: '',
    slug: '',
    short_description: '',
    description: '',
    cover_image_url: '',
    category_id: null,
    price: 0,
    discount_price: null,
    level: 'beginner',
    language: 'tr',
    is_published: false,
  };
}

@Component({
  selector: 'app-instructor-my-courses',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="mx-auto max-w-4xl px-4 py-10">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-brand-900">Kurslarım</h1>
        <a routerLink="/instructor/lessons" class="text-sm font-semibold text-brand-900 hover:underline">
          Ders Yönetimine Git →
        </a>
      </div>

      <table class="mt-6 w-full text-left text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-slate-500">
            <th class="py-2">Başlık</th>
            <th>Fiyat</th>
            <th>Yayında</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (course of courses; track course.id) {
            <tr class="border-b border-slate-100">
              <td class="py-2">{{ course.title }}</td>
              <td>{{ course.discount_price ?? course.price }} ₺</td>
              <td>{{ course.is_published ? 'Evet' : 'Hayır' }}</td>
              <td class="flex gap-2 py-2 text-right">
                <button type="button" class="text-brand-900 hover:underline" (click)="edit(course)">
                  Düzenle
                </button>
                <button type="button" class="text-red-600 hover:underline" (click)="remove(course)">
                  Sil
                </button>
              </td>
            </tr>
          }
        </tbody>
      </table>

      <h2 class="mt-10 text-lg font-bold text-brand-900">
        {{ editingId ? 'Kursu Düzenle' : 'Yeni Kurs' }}
      </h2>
      <form class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2" (ngSubmit)="save()">
        <label class="flex flex-col gap-1 text-sm">
          Başlık
          <input class="rounded-md border border-slate-300 px-3 py-2" [(ngModel)]="form.title" name="title" required />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          Slug
          <input class="rounded-md border border-slate-300 px-3 py-2" [(ngModel)]="form.slug" name="slug" required />
        </label>
        <label class="col-span-2 flex flex-col gap-1 text-sm">
          Kısa Açıklama
          <input
            class="rounded-md border border-slate-300 px-3 py-2"
            [(ngModel)]="form.short_description"
            name="short_description"
          />
        </label>
        <label class="col-span-2 flex flex-col gap-1 text-sm">
          Açıklama
          <textarea
            class="rounded-md border border-slate-300 px-3 py-2"
            rows="4"
            [(ngModel)]="form.description"
            name="description"
          ></textarea>
        </label>
        <label class="col-span-2 flex flex-col gap-1 text-sm">
          Kapak Görseli URL
          <input
            class="rounded-md border border-slate-300 px-3 py-2"
            [(ngModel)]="form.cover_image_url"
            name="cover_image_url"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          Kategori
          <select class="rounded-md border border-slate-300 px-3 py-2" [(ngModel)]="form.category_id" name="category_id">
            <option [ngValue]="null">—</option>
            @for (cat of categories; track cat.id) {
              <option [ngValue]="cat.id">{{ cat.name }}</option>
            }
          </select>
        </label>
        <label class="flex flex-col gap-1 text-sm">
          Seviye
          <select class="rounded-md border border-slate-300 px-3 py-2" [(ngModel)]="form.level" name="level">
            <option value="beginner">Başlangıç</option>
            <option value="intermediate">Orta</option>
            <option value="advanced">İleri</option>
          </select>
        </label>
        <label class="flex flex-col gap-1 text-sm">
          Fiyat (₺)
          <input type="number" class="rounded-md border border-slate-300 px-3 py-2" [(ngModel)]="form.price" name="price" />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          İndirimli Fiyat (₺)
          <input
            type="number"
            class="rounded-md border border-slate-300 px-3 py-2"
            [(ngModel)]="form.discount_price"
            name="discount_price"
          />
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" [(ngModel)]="form.is_published" name="is_published" />
          Yayında
        </label>

        <div class="col-span-2 flex gap-3">
          <button
            type="submit"
            class="rounded-md bg-accent-500 px-5 py-2 font-semibold text-brand-900 hover:bg-accent-600"
          >
            {{ editingId ? 'Güncelle' : 'Oluştur' }}
          </button>
          @if (editingId) {
            <button type="button" class="rounded-md border border-slate-300 px-5 py-2 text-sm" (click)="resetForm()">
              Vazgeç
            </button>
          }
        </div>
      </form>
    </section>
  `,
})
export class InstructorMyCoursesComponent implements OnInit {
  courses: AdminCourse[] = [];
  categories: Category[] = [];
  form: CourseForm = emptyForm();
  editingId: string | null = null;

  constructor(
    private readonly instructorService: InstructorService,
    private readonly categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.load();
    this.categoryService.list().subscribe((categories) => (this.categories = categories));
  }

  load() {
    this.instructorService.listCourses().subscribe((courses) => (this.courses = courses));
  }

  edit(course: AdminCourse) {
    this.editingId = course.id;
    this.form = { ...course };
  }

  resetForm() {
    this.editingId = null;
    this.form = emptyForm();
  }

  save() {
    const payload = { ...this.form };
    if (this.editingId) {
      this.instructorService.updateCourse(this.editingId, payload).subscribe(() => {
        this.resetForm();
        this.load();
      });
    } else {
      this.instructorService.createCourse(payload).subscribe(() => {
        this.resetForm();
        this.load();
      });
    }
  }

  remove(course: AdminCourse) {
    if (!confirm(`"${course.title}" silinsin mi?`)) return;
    this.instructorService.deleteCourse(course.id).subscribe(() => this.load());
  }
}
