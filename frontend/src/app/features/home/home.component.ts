import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Category } from '../../core/models/category.model';
import { Course } from '../../core/models/course.model';
import { CategoryService } from '../../core/services/category.service';
import { CourseService } from '../../core/services/course.service';
import { CourseCardComponent } from '../../shared/components/course-card/course-card.component';
import { CtaButtonComponent } from '../../shared/components/cta-button/cta-button.component';
import { SeoService } from '../../core/services/seo.service';
import { buildOrganizationJsonLd } from '../../core/utils/structured-data';

const BENEFIT_ICONS: Record<string, string> = {
  coupons: '🎟️',
  portal: '🖥️',
  roadmaps: '🗺️',
  contact: '📞',
};

const WHY_US_ICONS: Record<string, string> = {
  item1: '👨‍🏫',
  item2: '🛠️',
  item3: '🎯',
  item4: '⏱️',
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslatePipe, RouterLink, CourseCardComponent, CtaButtonComponent],
  template: `
    <section class="relative isolate overflow-hidden bg-brand-900 text-white">
      <!-- Nokta grid dokusu -->
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 -z-20 opacity-[0.35]"
        style="background-image: radial-gradient(circle, rgba(255,255,255,0.7) 1.5px, transparent 1.5px); background-size: 26px 26px; -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 20%, black 40%, transparent 100%); mask-image: radial-gradient(ellipse 70% 60% at 50% 20%, black 40%, transparent 100%);"
      ></div>
      <!-- Merkezi turuncu glow -->
      <div
        aria-hidden="true"
        class="pointer-events-none absolute left-1/2 top-0 -z-10 h-[30rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-500/25 blur-[140px]"
      ></div>
      <!-- Alt-sağ ikincil glow -->
      <div
        aria-hidden="true"
        class="pointer-events-none absolute -right-24 bottom-0 -z-10 h-72 w-72 rounded-full bg-accent-600/15 blur-[110px]"
      ></div>
      <!-- Sol üst üçüncül glow (derinlik) -->
      <div
        aria-hidden="true"
        class="pointer-events-none absolute -left-20 top-10 -z-10 h-64 w-64 rounded-full bg-accent-500/10 blur-[100px]"
      ></div>

      <div class="relative mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
        @if (hasDeals) {
          <div class="mb-8 flex justify-center">
            <a
              routerLink="/deals"
              class="group inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-500/10 px-4 py-1.5 text-xs font-medium text-white transition hover:border-accent-500/60 hover:bg-accent-500/15 sm:text-sm"
            >
              <span class="relative flex h-2 w-2">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-500 opacity-75"></span>
                <span class="relative inline-flex h-2 w-2 rounded-full bg-accent-500"></span>
              </span>
              {{ 'hero.announcement_text' | translate }}
              <span class="font-semibold text-accent-500 transition group-hover:text-accent-600">
                {{ 'hero.announcement_link' | translate }} →
              </span>
            </a>
          </div>
        }
        <h1 class="mx-auto max-w-3xl text-4xl font-bold tracking-tight leading-[1.1] sm:text-6xl">
          {{ 'hero.title' | translate }}
        </h1>
        <p class="mx-auto mt-6 max-w-2xl text-lg text-white/70">{{ 'hero.subtitle' | translate }}</p>
        <div class="mt-9 flex flex-wrap justify-center gap-4">
          <app-cta-button [label]="'hero.cta_explore' | translate" routerLink="/courses" variant="primary" />
          <app-cta-button [label]="'hero.cta_deals' | translate" routerLink="/courses" variant="secondary" />
        </div>

        @if (totalCourses) {
          <div class="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-4 border-t border-white/10 pt-8">
            <div>
              <p class="text-2xl font-bold text-accent-500 sm:text-3xl">{{ totalCourses }}+</p>
              <p class="mt-1 text-xs text-white/60 sm:text-sm">{{ 'hero.stat_courses' | translate }}</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-accent-500 sm:text-3xl">{{ totalCategories }}</p>
              <p class="mt-1 text-xs text-white/60 sm:text-sm">{{ 'hero.stat_categories' | translate }}</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-accent-500 sm:text-3xl">{{ totalVideos }}+</p>
              <p class="mt-1 text-xs text-white/60 sm:text-sm">{{ 'hero.stat_videos' | translate }}</p>
            </div>
          </div>
        }
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-16">
      <h2 class="text-center text-2xl font-bold text-brand-900 sm:text-3xl">{{ 'categories.title' | translate }}</h2>
      <p class="mx-auto mt-2 max-w-xl text-center text-slate-600">
        {{ 'categories.subtitle' | translate }}
      </p>
      <div class="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        @for (category of categories; track category.id) {
          <a
            [routerLink]="['/courses']"
            [queryParams]="{ category: category.id }"
            class="group flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-accent-500/50 hover:shadow-md"
          >
            <span class="flex h-12 w-12 items-center justify-center rounded-full bg-accent-500/10 text-2xl transition group-hover:bg-accent-500/20">
              {{ category.icon }}
            </span>
            <span class="text-sm font-semibold text-brand-900">{{ category.name }}</span>
          </a>
        }
      </div>
    </section>

    <section id="why-us" class="bg-brand-50 py-16">
      <div class="mx-auto max-w-6xl px-4">
        <h2 class="text-center text-2xl font-bold text-brand-900 sm:text-3xl">{{ 'why_us.title' | translate }}</h2>
        <div class="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2">
          @for (key of whyUsKeys; track key) {
            <div class="flex items-start gap-4 rounded-xl bg-white p-5 shadow-sm">
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-500/10 text-xl">
                {{ whyUsIcon(key) }}
              </span>
              <p class="pt-2 font-medium text-slate-700">{{ 'why_us.' + key | translate }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-16">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-2xl font-bold text-brand-900 sm:text-3xl">
          {{ 'courses_section.title' | translate }}
        </h2>
        <a routerLink="/courses" class="text-sm font-semibold text-accent-600 hover:underline">
          {{ 'courses_section.view_all' | translate }} →
        </a>
      </div>
      <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
        @for (course of courses; track course.id) {
          <app-course-card [course]="course" />
        }
      </div>
    </section>

    <div id="advantages" class="scroll-mt-20"></div>
    @if (hasDeals) {
      <section class="mx-auto max-w-6xl px-4 pb-4">
        <a
          routerLink="/deals"
          class="group relative flex flex-col items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 px-6 py-10 text-center shadow-md transition hover:shadow-lg sm:flex-row sm:justify-between sm:text-left"
        >
          <div class="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl"></div>
          <div class="relative">
            <span class="text-3xl">🎉</span>
            <h2 class="mt-2 text-2xl font-bold text-brand-900">{{ 'deals_teaser.title' | translate }}</h2>
            <p class="mt-1 max-w-md text-sm text-brand-900/80">{{ 'deals_teaser.subtitle' | translate }}</p>
          </div>
          <span
            class="relative shrink-0 rounded-full bg-brand-900 px-6 py-3 font-semibold text-white transition group-hover:bg-brand-800"
          >
            {{ 'deals_teaser.cta' | translate }} →
          </span>
        </a>
      </section>
    }

    <section id="student-benefits" class="bg-brand-50 py-16">
      <div class="mx-auto max-w-6xl px-4">
        <h2 class="text-center text-2xl font-bold text-brand-900 sm:text-3xl">
          {{ 'advantages.title' | translate }}
        </h2>
        <div class="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
          @for (item of advantageKeys; track item) {
            <div class="rounded-xl bg-white p-6 text-center shadow-sm transition hover:shadow-md">
              <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-500/10 text-2xl">
                {{ benefitIcon(item) }}
              </span>
              <h3 class="mt-4 font-semibold text-brand-900">{{ ('advantages.' + item + '_title') | translate }}</h3>
              <p class="mt-2 text-sm text-slate-600">{{ ('advantages.' + item + '_desc') | translate }}</p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  courses: Course[] = [];
  hasDeals = false;
  totalCourses = 0;
  totalCategories = 0;
  totalVideos = 0;
  readonly advantageKeys = ['coupons', 'portal', 'roadmaps', 'contact'];
  readonly whyUsKeys = ['item1', 'item2', 'item3', 'item4'];

  constructor(
    private readonly categoryService: CategoryService,
    private readonly courseService: CourseService,
    private readonly seo: SeoService
  ) {}

  ngOnInit() {
    this.seo.setTitle('');
    this.seo.setDescription(
      'BilimData ile veri bilimi, Python ve yazılım geliştirme alanlarında uzman eğitmenlerden online eğitimler alın.'
    );
    this.seo.setCanonical('/');
    this.seo.setJsonLd(buildOrganizationJsonLd(), 'organization-jsonld');
    this.categoryService.list().subscribe((categories) => {
      this.categories = categories;
      this.totalCategories = categories.length;
    });
    this.courseService.list().subscribe((courses) => {
      this.courses = courses.filter((c) => c.provider === 'internal').slice(0, 4);
      this.hasDeals = courses.some((c) => c.provider === 'udemy' || c.provider === 'external');
      this.totalCourses = courses.length;
    });
    this.courseService.getStats().subscribe((stats) => {
      this.totalVideos = stats.lesson_count;
    });
  }

  benefitIcon(key: string): string {
    return BENEFIT_ICONS[key] || '⭐';
  }

  whyUsIcon(key: string): string {
    return WHY_US_ICONS[key] || '✔️';
  }
}
