import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category } from '../../../core/models/category.model';
import { AdminCourse, AdminInstructor } from '../../../core/models/admin.model';
import { AdminService } from '../../../core/services/admin.service';
import { CategoryService } from '../../../core/services/category.service';
import { AdminNavComponent } from '../shared/admin-nav.component';

type CourseForm = Partial<AdminCourse> & {
  title: string;
  slug: string;
  price: number;
};

function emptyForm(): CourseForm {
  return {
    title: '',
    slug: '',
    short_description: '',
    description: '',
    cover_image_url: '',
    category_id: null,
    instructor_id: null,
    price: 0,
    discount_price: null,
    level: 'beginner',
    language: 'tr',
    is_published: false,
    provider: 'internal',
    platform_name: '',
    external_url: '',
    coupon_code: '',
  };
}

@Component({
  selector: 'app-course-editor',
  standalone: true,
  imports: [FormsModule, AdminNavComponent],
  template: `
    <app-admin-nav />
    <section class="mx-auto max-w-5xl px-4 pb-16">
      <h1 class="text-xl font-bold text-brand-900">Kurs Yönetimi</h1>

      <table class="mt-6 w-full text-left text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-slate-500">
            <th class="py-2">Başlık</th>
            <th>Sağlayıcı</th>
            <th>Fiyat</th>
            <th>Yayında</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (course of courses; track course.id) {
            <tr class="border-b border-slate-100">
              <td class="py-2">{{ course.title }}</td>
              <td>{{ course.provider === 'external' ? (course.platform_name || 'Harici') : 'Platform' }}</td>
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
          Eğitmen
          <select
            class="rounded-md border border-slate-300 px-3 py-2"
            [(ngModel)]="form.instructor_id"
            name="instructor_id"
          >
            <option [ngValue]="null">—</option>
            @for (ins of instructors; track ins.id) {
              <option [ngValue]="ins.id">{{ ins.title }}</option>
            }
          </select>
        </label>
        <label class="flex flex-col gap-1 text-sm">
          Fiyat (₺)
          <input
            type="number"
            class="rounded-md border border-slate-300 px-3 py-2"
            [(ngModel)]="form.price"
            name="price"
          />
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
        <label class="flex flex-col gap-1 text-sm">
          Seviye
          <select class="rounded-md border border-slate-300 px-3 py-2" [(ngModel)]="form.level" name="level">
            <option value="beginner">Başlangıç</option>
            <option value="intermediate">Orta</option>
            <option value="advanced">İleri</option>
          </select>
        </label>
        <label class="flex flex-col gap-1 text-sm">
          Dil
          <select class="rounded-md border border-slate-300 px-3 py-2" [(ngModel)]="form.language" name="language">
            <option value="tr">Türkçe</option>
            <option value="en">English</option>
          </select>
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" [(ngModel)]="form.is_published" name="is_published" />
          Yayında
        </label>
        <label class="flex flex-col gap-1 text-sm">
          Sağlayıcı
          <select class="rounded-md border border-slate-300 px-3 py-2" [(ngModel)]="form.provider" name="provider">
            <option value="internal">Platform (YouTube)</option>
            <option value="external">Harici Platform (Udemy, Coursera, vb.)</option>
          </select>
        </label>
        @if (form.provider === 'external') {
          <label class="flex flex-col gap-1 text-sm">
            Platform Adı
            <input
              class="rounded-md border border-slate-300 px-3 py-2"
              [(ngModel)]="form.platform_name"
              name="platform_name"
              placeholder="ör. Udemy, Coursera"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            Platform Linki
            <input
              class="rounded-md border border-slate-300 px-3 py-2"
              [(ngModel)]="form.external_url"
              name="external_url"
            />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            Kupon Kodu
            <input
              class="rounded-md border border-slate-300 px-3 py-2"
              [(ngModel)]="form.coupon_code"
              name="coupon_code"
            />
          </label>
        }

        <div class="col-span-2 flex gap-3">
          <button
            type="submit"
            class="rounded-md bg-accent-500 px-5 py-2 font-semibold text-brand-900 hover:bg-accent-600"
          >
            {{ editingId ? 'Güncelle' : 'Oluştur' }}
          </button>
          @if (editingId) {
            <button
              type="button"
              class="rounded-md border border-slate-300 px-5 py-2 text-sm"
              (click)="resetForm()"
            >
              Vazgeç
            </button>
          }
        </div>
      </form>
    </section>
  `,
})
export class CourseEditorComponent implements OnInit {
  courses: AdminCourse[] = [];
  categories: Category[] = [];
  instructors: AdminInstructor[] = [];
  form: CourseForm = emptyForm();
  editingId: string | null = null;

  constructor(
    private readonly adminService: AdminService,
    private readonly categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.load();
    this.categoryService.list().subscribe((categories) => (this.categories = categories));
    this.adminService.listInstructors().subscribe((instructors) => (this.instructors = instructors));
  }

  load() {
    this.adminService.listCourses().subscribe((courses) => (this.courses = courses));
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
      this.adminService.updateCourse(this.editingId, payload).subscribe(() => {
        this.resetForm();
        this.load();
      });
    } else {
      this.adminService.createCourse(payload).subscribe(() => {
        this.resetForm();
        this.load();
      });
    }
  }

  remove(course: AdminCourse) {
    if (!confirm(`"${course.title}" silinsin mi?`)) return;
    this.adminService.deleteCourse(course.id).subscribe(() => this.load());
  }
}
