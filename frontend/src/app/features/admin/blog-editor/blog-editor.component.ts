import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BlogPost } from '../../../core/models/blog.model';
import { AdminService } from '../../../core/services/admin.service';
import { AdminNavComponent } from '../shared/admin-nav.component';

type AdminBlogPost = BlogPost & { author?: { full_name: string | null } | null };

type BlogForm = Partial<BlogPost> & { title: string; slug: string; content: string };

function emptyForm(): BlogForm {
  return {
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    cover_image_url: '',
    category: '',
    tags: [],
    is_published: false,
  };
}

@Component({
  selector: 'app-blog-editor',
  standalone: true,
  imports: [FormsModule, AdminNavComponent],
  template: `
    <section class="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <app-admin-nav />

      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-bold text-brand-900">Blog Yönetimi</h2>
          <p class="mt-1 text-sm text-slate-500">{{ posts.length }} yazı</p>
        </div>
        <button
          type="button"
          class="rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-accent-600"
          (click)="openCreateForm()"
        >
          + Yeni Yazı
        </button>
      </div>

      @if (posts.length) {
        <div class="mt-6 flex flex-col gap-3">
          @for (post of posts; track post.id) {
            <div
              class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500/10 text-xl">📝</div>
                <div>
                  <p class="font-semibold text-brand-900">{{ post.title }}</p>
                  <p class="mt-0.5 text-xs text-slate-500">{{ post.author?.full_name || 'Yazar yok' }}</p>
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                @if (post.is_published) {
                  <span class="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                    >Yayında</span
                  >
                } @else {
                  <span class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700"
                    >Taslak / Onay Bekliyor</span
                  >
                }
                <button
                  type="button"
                  class="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-brand-900 hover:bg-slate-50"
                  (click)="edit(post)"
                >
                  ✏️ Düzenle
                </button>
                <button
                  type="button"
                  class="rounded-full border border-accent-500/40 px-3 py-1.5 text-xs font-semibold text-accent-600 hover:bg-accent-500/10"
                  (click)="summarize(post)"
                >
                  ✨ AI ile Özetle
                </button>
                <button
                  type="button"
                  class="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  (click)="remove(post)"
                >
                  🗑️ Sil
                </button>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 py-16 text-center">
          <span class="text-4xl">📝</span>
          <p class="text-sm text-slate-500">Henüz bir blog yazısı yok.</p>
        </div>
      }

      @if (showForm) {
        <div class="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-brand-900">{{ editingId ? 'Yazıyı Düzenle' : 'Yeni Yazı' }}</h2>
            <button type="button" class="text-sm text-slate-500 hover:text-slate-700" (click)="resetForm()">
              ✕ Kapat
            </button>
          </div>
          <form class="mt-4 flex flex-col gap-4" (ngSubmit)="save()">
            <label class="flex flex-col gap-1 text-sm">
              Başlık
              <input class="rounded-md border border-slate-300 px-3 py-2" [(ngModel)]="form.title" name="title" required />
            </label>
            <label class="flex flex-col gap-1 text-sm">
              Slug
              <input class="rounded-md border border-slate-300 px-3 py-2" [(ngModel)]="form.slug" name="slug" required />
            </label>
            <label class="flex flex-col gap-1 text-sm">
              Özet
              <input class="rounded-md border border-slate-300 px-3 py-2" [(ngModel)]="form.excerpt" name="excerpt" />
            </label>
            <label class="flex flex-col gap-1 text-sm">
              Kapak Görseli URL
              <input
                class="rounded-md border border-slate-300 px-3 py-2"
                [(ngModel)]="form.cover_image_url"
                name="cover_image_url"
              />
            </label>
            <label class="flex flex-col gap-1 text-sm">
              Video Linki
              <input class="rounded-md border border-slate-300 px-3 py-2" [(ngModel)]="form.video_url" name="video_url" />
            </label>
            <label class="flex flex-col gap-1 text-sm">
              Kategori
              <input class="rounded-md border border-slate-300 px-3 py-2" [(ngModel)]="form.category" name="category" />
            </label>
            <label class="flex flex-col gap-1 text-sm">
              İçerik
              <textarea
                class="rounded-md border border-slate-300 px-3 py-2"
                rows="8"
                [(ngModel)]="form.content"
                name="content"
                required
              ></textarea>
            </label>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" [(ngModel)]="form.is_published" name="is_published" />
              Yayında
            </label>

            <div class="flex gap-3">
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
export class BlogEditorComponent implements OnInit {
  posts: AdminBlogPost[] = [];
  form: BlogForm = emptyForm();
  editingId: string | null = null;
  showForm = false;

  constructor(private readonly adminService: AdminService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.adminService
      .listBlogPosts()
      .subscribe((posts) => (this.posts = posts as AdminBlogPost[]));
  }

  openCreateForm() {
    this.editingId = null;
    this.form = emptyForm();
    this.showForm = true;
  }

  edit(post: BlogPost) {
    this.editingId = post.id;
    this.form = { ...post };
    this.showForm = true;
  }

  summarize(post: AdminBlogPost) {
    this.adminService.summarizeBlogPost(post.id).subscribe(() => this.load());
  }

  resetForm() {
    this.editingId = null;
    this.form = emptyForm();
    this.showForm = false;
  }

  save() {
    const payload = { ...this.form };
    if (this.editingId) {
      this.adminService.updateBlogPost(this.editingId, payload).subscribe(() => {
        this.resetForm();
        this.load();
      });
    } else {
      this.adminService.createBlogPost(payload).subscribe(() => {
        this.resetForm();
        this.load();
      });
    }
  }

  remove(post: BlogPost) {
    if (!confirm(`"${post.title}" silinsin mi?`)) return;
    this.adminService.deleteBlogPost(post.id).subscribe(() => this.load());
  }
}
