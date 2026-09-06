import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LearningPath } from '../../../core/models/path.model';
import { PathService } from '../../../core/services/path.service';
import { SeoService } from '../../../core/services/seo.service';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-path-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <section class="mx-auto max-w-6xl px-4 py-12">
      <h1 class="text-2xl font-bold text-brand-900">{{ 'paths_page.title' | translate }}</h1>
      <p class="mt-2 max-w-2xl text-slate-600">{{ 'paths_page.subtitle' | translate }}</p>

      @if (pathsWithArticles.length === 0) {
        <p class="mt-10 text-center text-slate-500">{{ 'paths_page.empty' | translate }}</p>
      } @else {
        <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          @for (path of pathsWithArticles; track path.id; let i = $index) {
            <a
              [routerLink]="['/paths', path.slug, entryArticleSlug(path)]"
              class="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-accent-500/40 hover:shadow-lg"
            >
              @if (path.cover_image_url) {
                <img
                  [src]="path.cover_image_url"
                  [alt]="path.title"
                  class="h-36 w-full object-cover transition group-hover:scale-105"
                />
              } @else {
                <div
                  class="relative flex h-36 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-brand-900 to-brand-800 text-4xl"
                >
                  <div
                    aria-hidden="true"
                    class="pointer-events-none absolute inset-0 opacity-30"
                    style="background-image: radial-gradient(circle, rgba(255,255,255,0.6) 1.2px, transparent 1.2px); background-size: 18px 18px;"
                  ></div>
                  <span
                    class="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent-500/30 blur-2xl transition group-hover:bg-accent-500/50"
                  ></span>
                  <span class="relative transition group-hover:scale-110">🗺️</span>
                  <span
                    class="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white backdrop-blur"
                  >
                    {{ i + 1 }}
                  </span>
                </div>
              }
              <div class="flex flex-1 flex-col gap-2 p-4">
                <h3 class="font-semibold text-brand-900 transition group-hover:text-accent-600">{{ path.title }}</h3>
                @if (path.description) {
                  <p class="line-clamp-3 flex-1 text-sm text-slate-600">{{ path.description }}</p>
                }

                @if (progressFor(path.slug); as pct) {
                  <div class="mt-1">
                    <div class="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div class="h-full rounded-full bg-accent-500" [style.width.%]="pct"></div>
                    </div>
                  </div>
                }

                <div class="mt-1 flex items-center justify-between">
                  <span class="rounded-full bg-accent-500/10 px-2.5 py-1 text-xs font-semibold text-accent-600">
                    📄 {{ path.articles.length }} {{ 'paths_page.article_count' | translate }}
                  </span>
                  <span
                    class="flex items-center gap-1 text-xs font-semibold text-brand-900 opacity-0 transition group-hover:opacity-100"
                  >
                    {{ progressFor(path.slug) ? 'Devam Et' : 'Başla' }}
                    <span class="transition group-hover:translate-x-0.5">→</span>
                  </span>
                </div>
              </div>
            </a>
          }
        </div>
      }
    </section>
  `,
})
export class PathListComponent implements OnInit {
  paths: LearningPath[] = [];
  progressBySlug: Record<string, number> = {};
  nextArticleBySlug: Record<string, string> = {};

  constructor(
    private readonly pathService: PathService,
    private readonly seo: SeoService,
    private readonly supabase: SupabaseService
  ) {}

  ngOnInit() {
    this.seo.setTitle('Yol Haritaları');
    this.seo.setDescription(
      'Video izlemeden, okuyarak öğrenmek isteyenler için veri bilimi konularında yapay zeka destekli metinsel yol haritaları.'
    );
    this.seo.setCanonical('/paths');
    this.pathService.list().subscribe((paths) => (this.paths = paths));

    if (this.supabase.session$.value) {
      this.pathService.myProgressAll().subscribe((summaries) => {
        for (const s of summaries) {
          this.progressBySlug[s.slug] = s.progress_percent;
          if (s.next_article_slug) this.nextArticleBySlug[s.slug] = s.next_article_slug;
        }
      });
    }
  }

  get pathsWithArticles(): LearningPath[] {
    return this.paths.filter((path) => path.articles.length > 0);
  }

  progressFor(slug: string): number | null {
    return this.progressBySlug[slug] ?? null;
  }

  entryArticleSlug(path: LearningPath): string {
    return this.nextArticleBySlug[path.slug] ?? path.articles[0].slug;
  }
}
