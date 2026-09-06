import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminPath, AdminPathArticle } from '../../../core/models/admin.model';
import { Category } from '../../../core/models/category.model';
import { AdminService } from '../../../core/services/admin.service';
import { CategoryService } from '../../../core/services/category.service';
import { RichTextEditorComponent } from '../../../shared/components/rich-text-editor/rich-text-editor.component';
import { AdminNavComponent } from '../shared/admin-nav.component';

type PathForm = Partial<AdminPath> & { title: string; slug: string };

function emptyPathForm(): PathForm {
  return {
    title: '',
    slug: '',
    description: '',
    cover_image_url: '',
    category_id: null,
    is_published: false,
    order_index: 0,
  };
}

type ArticleForm = Partial<AdminPathArticle> & { title: string; slug: string; content: string };

function emptyArticleForm(nextOrderIndex: number): ArticleForm {
  return { title: '', slug: '', content: '', order_index: nextOrderIndex, ai_generated: false };
}

@Component({
  selector: 'app-path-editor',
  standalone: true,
  imports: [FormsModule, AdminNavComponent, RichTextEditorComponent],
  template: `
    <section class="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <app-admin-nav />

      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-bold text-brand-900">Yol Haritaları Yönetimi</h2>
          <p class="mt-1 text-sm text-slate-500">{{ paths.length }} yol haritası</p>
        </div>
        <button
          type="button"
          class="rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-accent-600"
          (click)="openCreatePathForm()"
        >
          + Yeni Yol Haritası
        </button>
      </div>

      @if (paths.length) {
        <div class="mt-6 flex flex-col gap-3">
          @for (path of paths; track path.id) {
            <div
              class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              [class.ring-2]="selectedPath?.id === path.id"
              [class.ring-accent-500]="selectedPath?.id === path.id"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-500/10 text-xl">🗺️</div>
                <div>
                  <p class="font-semibold text-brand-900">{{ path.title }}</p>
                  <span
                    class="rounded-full px-2 py-0.5 text-xs font-semibold"
                    [class]="path.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
                  >
                    {{ path.is_published ? 'Yayında' : 'Taslak' }}
                  </span>
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  class="rounded-full border border-accent-500/40 px-3 py-1.5 text-xs font-semibold text-accent-600 hover:bg-accent-500/10"
                  (click)="selectPath(path)"
                >
                  📄 Makaleler
                </button>
                <button
                  type="button"
                  class="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-brand-900 hover:bg-slate-50"
                  (click)="editPath(path)"
                >
                  ✏️ Düzenle
                </button>
                <button
                  type="button"
                  class="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  (click)="removePath(path)"
                >
                  🗑️ Sil
                </button>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 py-16 text-center">
          <span class="text-4xl">🗺️</span>
          <p class="text-sm text-slate-500">Henüz bir yol haritası oluşturulmadı.</p>
        </div>
      }

      @if (showPathForm) {
        <div class="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-brand-900">
              {{ editingPathId ? 'Yol Haritasını Düzenle' : 'Yeni Yol Haritası' }}
            </h2>
            <button type="button" class="text-sm text-slate-500 hover:text-slate-700" (click)="resetPathForm()">
              ✕ Kapat
            </button>
          </div>
          <form class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2" (ngSubmit)="savePath()">
            <label class="flex flex-col gap-1 text-sm">
              Başlık
              <input class="rounded-md border border-slate-300 px-3 py-2" [(ngModel)]="pathForm.title" name="title" required />
            </label>
            <label class="flex flex-col gap-1 text-sm">
              Slug
              <input class="rounded-md border border-slate-300 px-3 py-2" [(ngModel)]="pathForm.slug" name="slug" required />
            </label>
            <label class="col-span-2 flex flex-col gap-1 text-sm">
              Açıklama
              <textarea
                class="rounded-md border border-slate-300 px-3 py-2"
                rows="3"
                [(ngModel)]="pathForm.description"
                name="description"
              ></textarea>
            </label>
            <label class="col-span-2 flex flex-col gap-1 text-sm">
              Kapak Görseli URL
              <input
                class="rounded-md border border-slate-300 px-3 py-2"
                [(ngModel)]="pathForm.cover_image_url"
                name="cover_image_url"
              />
            </label>
            <label class="flex flex-col gap-1 text-sm">
              Kategori
              <select class="rounded-md border border-slate-300 px-3 py-2" [(ngModel)]="pathForm.category_id" name="category_id">
                <option [ngValue]="null">—</option>
                @for (cat of categories; track cat.id) {
                  <option [ngValue]="cat.id">{{ cat.name }}</option>
                }
              </select>
            </label>
            <label class="flex flex-col gap-1 text-sm">
              Sıra
              <input
                type="number"
                class="rounded-md border border-slate-300 px-3 py-2"
                [(ngModel)]="pathForm.order_index"
                name="order_index"
              />
            </label>
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" [(ngModel)]="pathForm.is_published" name="is_published" />
              Yayında
            </label>

            <div class="col-span-2 flex gap-3">
              <button
                type="submit"
                class="rounded-full bg-accent-500 px-5 py-2 text-sm font-semibold text-brand-900 hover:bg-accent-600"
              >
                {{ editingPathId ? 'Güncelle' : 'Oluştur' }}
              </button>
              <button
                type="button"
                class="rounded-full border border-slate-300 px-5 py-2 text-sm hover:bg-slate-50"
                (click)="resetPathForm()"
              >
                Vazgeç
              </button>
            </div>
          </form>
        </div>
      }

      @if (selectedPath) {
        <div class="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-lg font-bold text-brand-900">"{{ selectedPath.title }}" — Makaleler</h2>
            <button
              type="button"
              class="rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-accent-600"
              (click)="openCreateArticleForm()"
            >
              + Yeni Makale
            </button>
          </div>

          @if (articles.length) {
            <ul class="mt-4 flex flex-col gap-2">
              @for (article of articles; track article.id) {
                <li class="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-2.5">
                  <span class="text-sm font-medium text-brand-900">
                    {{ article.order_index + 1 }}. {{ article.title }}
                    @if (article.ai_generated) {
                      <span class="ml-1 text-xs text-accent-600">✨ AI</span>
                    }
                  </span>
                  <div class="flex gap-2">
                    <button
                      type="button"
                      class="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-brand-900 hover:bg-white"
                      (click)="editArticle(article)"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      class="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                      (click)="removeArticle(article)"
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              }
            </ul>
          } @else {
            <p class="mt-4 text-sm text-slate-500">Bu yol haritasında henüz makale yok.</p>
          }

          @if (showArticleForm) {
            <div class="mt-6 rounded-xl border border-slate-200 p-5">
              <div class="flex items-center justify-between">
                <h3 class="font-semibold text-brand-900">
                  {{ editingArticleId ? 'Makaleyi Düzenle' : 'Yeni Makale' }}
                </h3>
                <button type="button" class="text-sm text-slate-500 hover:text-slate-700" (click)="resetArticleForm()">
                  ✕ Kapat
                </button>
              </div>

              <div class="mt-4 flex flex-wrap items-end gap-3 rounded-lg bg-accent-500/5 p-3">
                <label class="flex flex-1 flex-col gap-1 text-sm">
                  AI ile İçerik Üret — Konu
                  <input
                    class="rounded-md border border-slate-300 px-3 py-2"
                    [(ngModel)]="aiTopic"
                    name="aiTopic"
                    placeholder="ör. Pandas ile Veri Temizleme"
                  />
                </label>
                <button
                  type="button"
                  class="rounded-full border border-accent-500/40 px-4 py-2 text-sm font-semibold text-accent-600 hover:bg-accent-500/10 disabled:opacity-50"
                  [disabled]="!aiTopic.trim() || generating"
                  (click)="generateWithAi()"
                >
                  {{ generating ? 'Üretiliyor…' : '✨ AI ile Üret' }}
                </button>
              </div>

              <form class="mt-4 flex flex-col gap-4" (ngSubmit)="saveArticle()">
                <label class="flex flex-col gap-1 text-sm">
                  Başlık
                  <input
                    class="rounded-md border border-slate-300 px-3 py-2"
                    [(ngModel)]="articleForm.title"
                    name="title"
                    required
                  />
                </label>
                <label class="flex flex-col gap-1 text-sm">
                  Slug
                  <input
                    class="rounded-md border border-slate-300 px-3 py-2"
                    [(ngModel)]="articleForm.slug"
                    name="slug"
                    required
                  />
                </label>
                <label class="flex flex-col gap-1 text-sm">
                  Sıra
                  <input
                    type="number"
                    class="rounded-md border border-slate-300 px-3 py-2"
                    [(ngModel)]="articleForm.order_index"
                    name="order_index"
                  />
                </label>
                <label class="flex flex-col gap-1 text-sm">
                  İçerik
                  <app-rich-text-editor [(ngModel)]="articleForm.content" name="content" />
                </label>

                <div class="flex gap-3">
                  <button
                    type="submit"
                    class="rounded-full bg-accent-500 px-5 py-2 text-sm font-semibold text-brand-900 hover:bg-accent-600"
                  >
                    {{ editingArticleId ? 'Güncelle' : 'Oluştur' }}
                  </button>
                  <button
                    type="button"
                    class="rounded-full border border-slate-300 px-5 py-2 text-sm hover:bg-slate-50"
                    (click)="resetArticleForm()"
                  >
                    Vazgeç
                  </button>
                </div>
              </form>
            </div>
          }
        </div>
      }
    </section>
  `,
})
export class PathEditorComponent implements OnInit {
  paths: AdminPath[] = [];
  categories: Category[] = [];
  pathForm: PathForm = emptyPathForm();
  editingPathId: string | null = null;
  showPathForm = false;

  selectedPath: AdminPath | null = null;
  articles: AdminPathArticle[] = [];
  articleForm: ArticleForm = emptyArticleForm(0);
  editingArticleId: string | null = null;
  showArticleForm = false;
  aiTopic = '';
  generating = false;

  constructor(
    private readonly adminService: AdminService,
    private readonly categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.loadPaths();
    this.categoryService.list().subscribe((categories) => (this.categories = categories));
  }

  loadPaths() {
    this.adminService.listPaths().subscribe((paths) => (this.paths = paths));
  }

  openCreatePathForm() {
    this.editingPathId = null;
    this.pathForm = emptyPathForm();
    this.showPathForm = true;
  }

  editPath(path: AdminPath) {
    this.editingPathId = path.id;
    this.pathForm = { ...path };
    this.showPathForm = true;
  }

  resetPathForm() {
    this.editingPathId = null;
    this.pathForm = emptyPathForm();
    this.showPathForm = false;
  }

  savePath() {
    const payload = { ...this.pathForm };
    if (this.editingPathId) {
      this.adminService.updatePath(this.editingPathId, payload).subscribe(() => {
        this.resetPathForm();
        this.loadPaths();
      });
    } else {
      this.adminService.createPath(payload).subscribe(() => {
        this.resetPathForm();
        this.loadPaths();
      });
    }
  }

  removePath(path: AdminPath) {
    if (!confirm(`"${path.title}" silinsin mi? (İçindeki tüm makaleler de silinir)`)) return;
    this.adminService.deletePath(path.id).subscribe(() => {
      if (this.selectedPath?.id === path.id) {
        this.selectedPath = null;
        this.articles = [];
      }
      this.loadPaths();
    });
  }

  selectPath(path: AdminPath) {
    this.selectedPath = path;
    this.resetArticleForm();
    this.loadArticles();
  }

  loadArticles() {
    if (!this.selectedPath) return;
    this.adminService
      .listPathArticles(this.selectedPath.id)
      .subscribe((articles) => (this.articles = articles));
  }

  openCreateArticleForm() {
    this.editingArticleId = null;
    this.articleForm = emptyArticleForm(this.articles.length);
    this.aiTopic = '';
    this.showArticleForm = true;
  }

  editArticle(article: AdminPathArticle) {
    this.editingArticleId = article.id;
    this.articleForm = { ...article };
    this.aiTopic = '';
    this.showArticleForm = true;
  }

  resetArticleForm() {
    this.editingArticleId = null;
    this.articleForm = emptyArticleForm(this.articles.length);
    this.aiTopic = '';
    this.showArticleForm = false;
  }

  generateWithAi() {
    if (!this.selectedPath || !this.aiTopic.trim()) return;
    this.generating = true;
    this.adminService.generatePathArticle(this.selectedPath.id, this.aiTopic).subscribe({
      next: (result) => {
        this.articleForm.content = result.content;
        if (!this.articleForm.title) this.articleForm.title = this.aiTopic;
        this.articleForm.ai_generated = true;
        this.generating = false;
      },
      error: () => (this.generating = false),
    });
  }

  saveArticle() {
    if (!this.selectedPath) return;
    const payload = { ...this.articleForm };
    if (this.editingArticleId) {
      this.adminService.updatePathArticle(this.editingArticleId, payload).subscribe(() => {
        this.resetArticleForm();
        this.loadArticles();
      });
    } else {
      this.adminService.createPathArticle(this.selectedPath.id, payload).subscribe(() => {
        this.resetArticleForm();
        this.loadArticles();
      });
    }
  }

  removeArticle(article: AdminPathArticle) {
    if (!confirm(`"${article.title}" silinsin mi?`)) return;
    this.adminService.deletePathArticle(article.id).subscribe(() => this.loadArticles());
  }
}
