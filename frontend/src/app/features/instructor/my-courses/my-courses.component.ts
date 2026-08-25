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
    provider: 'internal',
    external_url: '',
    coupon_code: '',
  };
}

@Component({
  selector: 'app-instructor-my-courses',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="mx-auto max-w-5xl px-4 py-10">
      <div class="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 to-brand-800 px-6 py-8 text-white shadow-md sm:px-8">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 class="text-xl font-bold sm:text-2xl">Kurslarım</h1>
            <p class="mt-1 text-sm text-white/70">{{ courses.length }} kurs yönetiyorsun</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <a
              routerLink="/instructor/lessons"
              class="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
            >
              📚 Ders Yönetimi
            </a>
            <button
              type="button"
              class="rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-accent-600"
              (click)="openCreateForm()"
            >
              + Yeni Kurs
            </button>
          </div>
        </div>
      </div>

      @if (courses.length) {
        <div class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          @for (course of courses; track course.id) {
            <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
              <div class="relative aspect-video w-full bg-slate-100">
                @if (course.cover_image_url) {
                  <img [src]="course.cover_image_url" class="h-full w-full object-cover" [alt]="course.title" />
                } @else {
                  <div class="flex h-full items-center justify-center text-3xl">📘</div>
                }
                <span
                  class="absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-semibold text-white shadow"
                  [class]="course.is_published ? 'bg-emerald-500' : 'bg-slate-500'"
                >
                  {{ course.is_published ? 'Yayında' : 'Taslak' }}
                </span>
                @if (course.provider === 'udemy') {
                  <span class="absolute left-2 top-2 rounded-full bg-purple-600 px-2 py-0.5 text-xs font-semibold text-white shadow">
                    🔗 Udemy
                  </span>
                }
              </div>
              <div class="p-4">
                <p class="font-semibold text-brand-900">{{ course.title }}</p>
                @if (course.provider === 'udemy') {
                  <p class="mt-1 text-sm text-slate-500">
                    Udemy üzerinden satılıyor
                    @if (course.coupon_code) {
                      <span class="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono">{{ course.coupon_code }}</span>
                    }
                  </p>
                } @else {
                  <p class="mt-1 text-sm text-slate-500">
                    {{ course.discount_price ?? course.price }} ₺
                    @if (course.discount_price !== null && course.discount_price !== undefined) {
                      <span class="ml-1 text-xs text-slate-400 line-through">{{ course.price }} ₺</span>
                    }
                  </p>
                }
                <div class="mt-4 flex gap-2">
                  <button
                    type="button"
                    class="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-brand-900 hover:bg-slate-50"
                    (click)="edit(course)"
                  >
                    ✏️ Düzenle
                  </button>
                  <button
                    type="button"
                    class="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    (click)="remove(course)"
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 py-16 text-center">
          <span class="text-4xl">🗂️</span>
          <p class="text-sm text-slate-500">Henüz bir kurs oluşturmadın.</p>
        </div>
      }

      @if (showForm) {
        <div class="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-brand-900">
              {{ editingId ? 'Kursu Düzenle' : 'Yeni Kurs' }}
            </h2>
            <button type="button" class="text-sm text-slate-500 hover:text-slate-700" (click)="resetForm()">
              ✕ Kapat
            </button>
          </div>
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

            <label class="col-span-2 flex flex-col gap-1 text-sm">
              Kurs Nerede Satılıyor?
              <select class="rounded-md border border-slate-300 px-3 py-2" [(ngModel)]="form.provider" name="provider">
                <option value="internal">Platformumuzda (YouTube ile)</option>
                <option value="udemy">Udemy'de — burada yalnızca tanıtımını yapıyorum</option>
              </select>
            </label>
            @if (form.provider === 'udemy') {
              <label class="flex flex-col gap-1 text-sm">
                Udemy Kurs Linki
                <input
                  class="rounded-md border border-slate-300 px-3 py-2"
                  [(ngModel)]="form.external_url"
                  name="external_url"
                  placeholder="https://www.udemy.com/course/..."
                />
              </label>
              <label class="flex flex-col gap-1 text-sm">
                Kupon Kodu (opsiyonel)
                <input
                  class="rounded-md border border-slate-300 px-3 py-2"
                  [(ngModel)]="form.coupon_code"
                  name="coupon_code"
                  placeholder="ör. BILIMDATA10"
                />
              </label>
            }

            <div class="col-span-2 flex gap-3">
              <button
                type="submit"
                class="rounded-full bg-accent-500 px-5 py-2 text-sm font-semibold text-brand-900 hover:bg-accent-600"
              >
                {{ editingId ? 'Güncelle' : 'Oluştur' }}
              </button>
              <button
                type="button"
                class="rounded-full border border-slate-300 px-5 py-2 text-sm hover:bg-slate-50"
                (click)="resetForm()"
              >
                Vazgeç
              </button>
            </div>
          </form>
        </div>
      }
    </section>
  `,
})
export class InstructorMyCoursesComponent implements OnInit {
  courses: AdminCourse[] = [];
  categories: Category[] = [];
  form: CourseForm = emptyForm();
  editingId: string | null = null;
  showForm = false;

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

  openCreateForm() {
    this.editingId = null;
    this.form = emptyForm();
    this.showForm = true;
  }

  edit(course: AdminCourse) {
    this.editingId = course.id;
    this.form = { ...course };
    this.showForm = true;
  }

  resetForm() {
    this.editingId = null;
    this.form = emptyForm();
    this.showForm = false;
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
