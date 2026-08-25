import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { BlogPost } from '../../../core/models/blog.model';
import { BlogService } from '../../../core/services/blog.service';
import { RichTextEditorComponent } from '../../../shared/components/rich-text-editor/rich-text-editor.component';

type PostForm = Partial<BlogPost> & { title: string; slug: string; content: string };

function emptyForm(): PostForm {
  return {
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    cover_image_url: '',
    video_url: '',
    category: '',
    tags: [],
  };
}

@Component({
  selector: 'app-blog-write',
  standalone: true,
  imports: [FormsModule, TranslatePipe, RichTextEditorComponent],
  template: `
    <section class="mx-auto max-w-3xl px-4 py-12">
      <h1 class="text-2xl font-bold text-brand-900">{{ 'blog_page.write_title' | translate }}</h1>
      <p class="mt-2 text-sm text-slate-600">{{ 'blog_page.write_info' | translate }}</p>

      <form class="mt-8 flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm" (ngSubmit)="submit()">
        <label class="flex flex-col gap-1 text-sm">
          <span class="font-semibold text-brand-900">Başlık</span>
          <input
            class="rounded-md border border-slate-300 px-3 py-2 text-base"
            [(ngModel)]="form.title"
            name="title"
            placeholder="Yazınızın başlığı"
            required
          />
        </label>

        <label class="flex flex-col gap-1 text-sm">
          <span class="font-semibold text-brand-900">Slug (URL)</span>
          <input
            class="rounded-md border border-slate-300 px-3 py-2"
            [(ngModel)]="form.slug"
            name="slug"
            placeholder="yazininiz-url-adi"
            required
          />
        </label>

        <label class="flex flex-col gap-1 text-sm">
          <span class="font-semibold text-brand-900">Özet</span>
          <input
            class="rounded-md border border-slate-300 px-3 py-2"
            [(ngModel)]="form.excerpt"
            name="excerpt"
            placeholder="Yazınızı 1-2 cümleyle özetleyin"
          />
        </label>

        <div class="flex flex-col gap-2">
          <span class="text-sm font-semibold text-brand-900">Kapak Görseli</span>
          @if (form.cover_image_url) {
            <div class="relative w-fit">
              <img [src]="form.cover_image_url" class="h-40 rounded-md object-cover" alt="Kapak görseli" />
              <button
                type="button"
                class="absolute -right-2 -top-2 rounded-full bg-white px-2 py-0.5 text-xs shadow"
                (click)="form.cover_image_url = ''"
              >
                ✕
              </button>
            </div>
          } @else {
            <label
              class="flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-slate-300 text-sm text-slate-500 hover:border-accent-500 hover:text-accent-600"
            >
              @if (uploadingImage) {
                <span>Yükleniyor...</span>
              } @else {
                <span>📷 Görsel yüklemek için tıklayın</span>
              }
              <input type="file" accept="image/*" class="hidden" (change)="onImageSelected($event)" />
            </label>
          }
        </div>

        <label class="flex flex-col gap-1 text-sm">
          <span class="font-semibold text-brand-900">Video Linki (opsiyonel)</span>
          <input
            class="rounded-md border border-slate-300 px-3 py-2"
            [(ngModel)]="form.video_url"
            name="video_url"
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </label>

        <label class="flex flex-col gap-1 text-sm">
          <span class="font-semibold text-brand-900">Kategori</span>
          <input
            class="rounded-md border border-slate-300 px-3 py-2"
            [(ngModel)]="form.category"
            name="category"
            placeholder="Örn. Veri Bilimi"
          />
        </label>

        <div class="flex flex-col gap-1 text-sm">
          <span class="font-semibold text-brand-900">İçerik</span>
          <app-rich-text-editor [(ngModel)]="form.content" name="content" />
        </div>

        @if (errorMessage) {
          <p class="text-sm text-red-600">{{ errorMessage }}</p>
        }
        @if (submitted) {
          <p class="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {{ 'blog_page.write_success' | translate }}
          </p>
        }

        <button
          type="submit"
          [disabled]="submitting"
          class="self-start rounded-md bg-accent-500 px-6 py-2.5 font-semibold text-brand-900 hover:bg-accent-600 disabled:opacity-50"
        >
          {{ 'blog_page.write_submit' | translate }}
        </button>
      </form>

      @if (myPosts.length) {
        <div class="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-bold text-brand-900">{{ 'blog_page.my_posts_title' | translate }}</h2>
          <table class="mt-4 w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-slate-500">
                <th class="py-2">Başlık</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              @for (post of myPosts; track post.id) {
                <tr class="border-b border-slate-100">
                  <td class="py-2">{{ post.title }}</td>
                  <td>
                    @if (post.is_published) {
                      <span class="text-emerald-600">{{ 'blog_page.status_published' | translate }}</span>
                    } @else {
                      <span class="text-amber-600">{{ 'blog_page.status_pending' | translate }}</span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
})
export class BlogWriteComponent implements OnInit {
  form: PostForm = emptyForm();
  myPosts: BlogPost[] = [];
  submitting = false;
  submitted = false;
  uploadingImage = false;
  errorMessage = '';

  constructor(private readonly blogService: BlogService) {}

  ngOnInit() {
    this.loadMyPosts();
  }

  loadMyPosts() {
    this.blogService.myPosts().subscribe((posts) => (this.myPosts = posts));
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadingImage = true;
    this.blogService.uploadImage(file).subscribe({
      next: (result) => {
        this.uploadingImage = false;
        this.form.cover_image_url = result.url;
      },
      error: () => (this.uploadingImage = false),
    });
  }

  submit() {
    this.submitting = true;
    this.errorMessage = '';
    this.submitted = false;
    this.blogService.createMyPost(this.form).subscribe({
      next: () => {
        this.submitting = false;
        this.submitted = true;
        this.form = emptyForm();
        this.loadMyPosts();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err?.error?.detail || 'Yazı gönderilemedi';
      },
    });
  }
}
