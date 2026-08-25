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
    <app-admin-nav />
    <section class="mx-auto max-w-4xl px-4 pb-16">
      <h1 class="text-xl font-bold text-brand-900">Blog Yönetimi</h1>

      <table class="mt-6 w-full text-left text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-slate-500">
            <th class="py-2">Başlık</th>
            <th>Yazar</th>
            <th>Durum</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (post of posts; track post.id) {
            <tr class="border-b border-slate-100">
              <td class="py-2">{{ post.title }}</td>
              <td>{{ post.author?.full_name || '—' }}</td>
              <td>
                @if (post.is_published) {
                  <span class="text-emerald-600">Yayında</span>
                } @else {
                  <span class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700"
                    >Taslak / Onay Bekliyor</span
                  >
                }
              </td>
              <td class="flex flex-wrap justify-end gap-2 py-2 text-right">
                <button type="button" class="text-brand-900 hover:underline" (click)="edit(post)">Düzenle</button>
                <button type="button" class="text-accent-600 hover:underline" (click)="summarize(post)">
                  AI ile Özetle
                </button>
                <button type="button" class="text-red-600 hover:underline" (click)="remove(post)">Sil</button>
              </td>
            </tr>
          }
        </tbody>
      </table>

      <h2 class="mt-10 text-lg font-bold text-brand-900">{{ editingId ? 'Yazıyı Düzenle' : 'Yeni Yazı' }}</h2>
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
export class BlogEditorComponent implements OnInit {
  posts: AdminBlogPost[] = [];
  form: BlogForm = emptyForm();
  editingId: string | null = null;

  constructor(private readonly adminService: AdminService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.adminService
      .listBlogPosts()
      .subscribe((posts) => (this.posts = posts as AdminBlogPost[]));
  }

  edit(post: BlogPost) {
    this.editingId = post.id;
    this.form = { ...post };
  }

  summarize(post: AdminBlogPost) {
    this.adminService.summarizeBlogPost(post.id).subscribe(() => this.load());
  }

  resetForm() {
    this.editingId = null;
    this.form = emptyForm();
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
