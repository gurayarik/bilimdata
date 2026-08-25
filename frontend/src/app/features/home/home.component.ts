import { Component, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Category } from '../../core/models/category.model';
import { Course } from '../../core/models/course.model';
import { CategoryService } from '../../core/services/category.service';
import { CourseService } from '../../core/services/course.service';
import { CourseCardComponent } from '../../shared/components/course-card/course-card.component';
import { CtaButtonComponent } from '../../shared/components/cta-button/cta-button.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslatePipe, CourseCardComponent, CtaButtonComponent],
  template: `
    <section class="bg-brand-900 text-white">
      <div class="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 class="text-3xl font-bold sm:text-4xl">{{ 'hero.title' | translate }}</h1>
        <p class="mx-auto mt-4 max-w-2xl text-white/80">{{ 'hero.subtitle' | translate }}</p>
        <div class="mt-8 flex justify-center gap-4">
          <app-cta-button [label]="'hero.cta_explore' | translate" routerLink="/courses" variant="primary" />
          <app-cta-button
            [label]="'hero.cta_deals' | translate"
            routerLink="/courses"
            variant="secondary"
          />
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-16">
      <h2 class="text-center text-2xl font-bold text-brand-900">{{ 'categories.title' | translate }}</h2>
      <p class="mx-auto mt-2 max-w-xl text-center text-slate-600">
        {{ 'categories.subtitle' | translate }}
      </p>
      <div class="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        @for (category of categories; track category.id) {
          <div class="rounded-lg border border-slate-200 p-4 text-center">
            <div class="text-3xl">{{ category.icon }}</div>
            <div class="mt-2 text-sm font-semibold text-brand-900">{{ category.name }}</div>
          </div>
        }
      </div>
    </section>

    <section id="why-us" class="bg-brand-50 py-16">
      <div class="mx-auto max-w-6xl px-4">
        <h2 class="text-center text-2xl font-bold text-brand-900">{{ 'why_us.title' | translate }}</h2>
        <ul class="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          @for (key of ['item1', 'item2', 'item3', 'item4']; track key) {
            <li class="flex items-center gap-2 text-slate-700">
              <span class="text-accent-500">✔</span>
              {{ 'why_us.' + key | translate }}
            </li>
          }
        </ul>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-16">
      <h2 class="text-center text-2xl font-bold text-brand-900">
        {{ 'courses_section.title' | translate }}
      </h2>
      <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
        @for (course of courses; track course.id) {
          <app-course-card [course]="course" />
        }
      </div>
    </section>

    <div id="advantages" class="scroll-mt-20"></div>
    @if (udemyCourses.length) {
      <section class="mx-auto max-w-6xl px-4 py-16">
        <h2 class="text-center text-2xl font-bold text-brand-900">
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
        <h2 class="text-center text-2xl font-bold text-brand-900">
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
        <h2 class="text-center text-2xl font-bold text-brand-900">
          {{ 'advantages.title' | translate }}
        </h2>
        <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          @for (item of advantageKeys; track item) {
            <div class="rounded-lg bg-white p-5 shadow-sm">
              <h3 class="font-semibold text-brand-900">{{ ('advantages.' + item + '_title') | translate }}</h3>
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
  readonly advantageKeys = ['coupons', 'portal', 'roadmaps', 'contact'];

  constructor(
    private readonly categoryService: CategoryService,
    private readonly courseService: CourseService
  ) {}

  ngOnInit() {
    this.categoryService.list().subscribe((categories) => (this.categories = categories));
    this.courseService.list().subscribe((courses) => {
      this.courses = courses.filter((c) => c.provider === 'internal').slice(0, 4);
      this.udemyCourses = courses.filter(
        (c) => c.provider === 'udemy' && c.instructor?.is_platform_official !== false
      );
      this.instructorExternalCourses = courses.filter(
        (c) => (c.provider === 'udemy' || c.provider === 'external') && c.instructor?.is_platform_official === false
      );
    });
  }
}
