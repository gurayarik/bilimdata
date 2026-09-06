import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LearningPath } from '../../../core/models/path.model';
import { PathService } from '../../../core/services/path.service';
import { SeoService } from '../../../core/services/seo.service';

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
          @for (path of pathsWithArticles; track path.id) {
            <a
              [routerLink]="['/paths', path.slug, path.articles[0].slug]"
              class="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              @if (path.cover_image_url) {
                <img [src]="path.cover_image_url" [alt]="path.title" class="h-40 w-full object-cover" />
              } @else {
                <div class="flex h-40 w-full items-center justify-center bg-accent-500/10 text-4xl">🗺️</div>
              }
              <div class="flex flex-1 flex-col gap-2 p-4">
                <h3 class="font-semibold text-brand-900">{{ path.title }}</h3>
                @if (path.description) {
                  <p class="line-clamp-3 flex-1 text-sm text-slate-600">{{ path.description }}</p>
                }
                <span class="text-xs font-semibold text-accent-600">
                  {{ path.articles.length }} {{ 'paths_page.article_count' | translate }}
                </span>
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

  constructor(
    private readonly pathService: PathService,
    private readonly seo: SeoService
  ) {}

  ngOnInit() {
    this.seo.setTitle('Yol Haritaları');
    this.seo.setDescription(
      'Video izlemeden, okuyarak öğrenmek isteyenler için veri bilimi konularında yapay zeka destekli metinsel yol haritaları.'
    );
    this.seo.setCanonical('/paths');
    this.pathService.list().subscribe((paths) => (this.paths = paths));
  }

  get pathsWithArticles(): LearningPath[] {
    return this.paths.filter((path) => path.articles.length > 0);
  }
}
