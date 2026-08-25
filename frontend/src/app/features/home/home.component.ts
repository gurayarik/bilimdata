import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Category } from '../../core/models/category.model';
import { Course } from '../../core/models/course.model';
import { CategoryService } from '../../core/services/category.service';
import { CourseService } from '../../core/services/course.service';
import { CourseCardComponent } from '../../shared/components/course-card/course-card.component';
import { CtaButtonComponent } from '../../shared/components/cta-button/cta-button.component';

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
    <section class="relative overflow-hidden bg-brand-900 text-white">
      <div class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl"></div>
      <div class="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-white/5 blur-3xl"></div>

      <div class="relative mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
        <span class="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-accent-500">
          BilimData
        </span>
        <h1 class="mx-auto mt-5 max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">
          {{ 'hero.title' | translate }}
        </h1>
        <p class="mx-auto mt-5 max-w-2xl text-lg text-white/80">{{ 'hero.subtitle' | translate }}</p>
        <div class="mt-8 flex flex-wrap justify-center gap-4">
          <app-cta-button [label]="'hero.cta_explore' | translate" routerLink="/courses" variant="primary" />
          <app-cta-button [label]="'hero.cta_deals' | translate" routerLink="/courses" variant="secondary" />
        </div>

        @if (totalCourses) {
          <div class="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-4 border-t border-white/10 pt-8">
            <div>
              <p class="text-2xl font-bold text-accent-500 sm:text-3xl">{{ totalCourses }}+</p>
              <p class="mt-1 text-xs text-white/60 sm:text-sm">{{ 'hero.stat_courses' | translate }}</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-accent-500 sm:text-3xl">{{ totalCategories }}</p>
              <p class="mt-1 text-xs text-white/60 sm:text-sm">{{ 'hero.stat_categories' | translate }}</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-accent-500 sm:text-3xl">{{ totalInstructors }}+</p>
              <p class="mt-1 text-xs text-white/60 sm:text-sm">{{ 'hero.stat_instructors' | translate }}</p>
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
    @if (udemyCourses.length) {
      <section class="mx-auto max-w-6xl px-4 py-16">
        <h2 class="text-center text-2xl font-bold text-brand-900 sm:text-3xl">
          {{ 'udemy_section.title' | translate }}
        </h2>
        <p class="mx-auto mt-2 max-w-xl text-center text-slate-600">
          {{ 'udemy_section.subtitle' | translate }}
        </p>
        <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          @for (course of udemyCourses; track course.id) {
            <app-course-card [course]="course" />
          }
        </div>
      </section>
    }

    @if (instructorExternalCourses.length) {
      <section class="mx-auto max-w-6xl px-4 py-16">
        <h2 class="text-center text-2xl font-bold text-brand-900 sm:text-3xl">
          {{ 'external_section.title' | translate }}
        </h2>
        <p class="mx-auto mt-2 max-w-xl text-center text-slate-600">
          {{ 'external_section.subtitle' | translate }}
        </p>
        <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          @for (course of instructorExternalCourses; track course.id) {
            <app-course-card [course]="course" />
          }
        </div>
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
  udemyCourses: Course[] = [];
  instructorExternalCourses: Course[] = [];
  totalCourses = 0;
  totalCategories = 0;
  totalInstructors = 0;
  readonly advantageKeys = ['coupons', 'portal', 'roadmaps', 'contact'];
  readonly whyUsKeys = ['item1', 'item2', 'item3', 'item4'];

  constructor(
    private readonly categoryService: CategoryService,
    private readonly courseService: CourseService
  ) {}

  ngOnInit() {
    this.categoryService.list().subscribe((categories) => {
      this.categories = categories;
      this.totalCategories = categories.length;
    });
    this.courseService.list().subscribe((courses) => {
      this.courses = courses.filter((c) => c.provider === 'internal').slice(0, 4);
      this.udemyCourses = courses.filter(
        (c) => c.provider === 'udemy' && c.instructor?.is_platform_official !== false
      );
      this.instructorExternalCourses = courses.filter(
        (c) => (c.provider === 'udemy' || c.provider === 'external') && c.instructor?.is_platform_official === false
      );
      this.totalCourses = courses.length;
      this.totalInstructors = new Set(courses.map((c) => c.instructor?.id).filter(Boolean)).size;
    });
  }

  benefitIcon(key: string): string {
    return BENEFIT_ICONS[key] || '⭐';
  }

  whyUsIcon(key: string): string {
    return WHY_US_ICONS[key] || '✔️';
  }
}
