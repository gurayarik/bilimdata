import { Component, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Category } from '../../../core/models/category.model';
import { Course } from '../../../core/models/course.model';
import { CategoryService } from '../../../core/services/category.service';
import { CourseService } from '../../../core/services/course.service';
import { CourseCardComponent } from '../../../shared/components/course-card/course-card.component';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [TranslatePipe, CourseCardComponent],
  template: `
    <section class="mx-auto max-w-6xl px-4 py-12">
      <h1 class="text-2xl font-bold text-brand-900">{{ 'courses_page.title' | translate }}</h1>

      <div class="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          class="rounded-full border px-4 py-1.5 text-sm"
          [class.bg-brand-900]="selectedCategoryId === null"
          [class.text-white]="selectedCategoryId === null"
          (click)="selectCategory(null)"
        >
          {{ 'courses_page.all_categories' | translate }}
        </button>
        @for (category of categories; track category.id) {
          <button
            type="button"
            class="rounded-full border px-4 py-1.5 text-sm"
            [class.bg-brand-900]="selectedCategoryId === category.id"
            [class.text-white]="selectedCategoryId === category.id"
            (click)="selectCategory(category.id)"
          >
            {{ category.icon }} {{ category.name }}
          </button>
        }
      </div>

      @if (courses.length === 0) {
        <p class="mt-10 text-center text-slate-500">{{ 'courses_page.empty' | translate }}</p>
      } @else {
        <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          @for (course of courses; track course.id) {
            <app-course-card [course]="course" />
          }
        </div>
      }
    </section>
  `,
})
export class CourseListComponent implements OnInit {
  categories: Category[] = [];
  courses: Course[] = [];
  selectedCategoryId: string | null = null;

  constructor(
    private readonly categoryService: CategoryService,
    private readonly courseService: CourseService
  ) {}

  ngOnInit() {
    this.categoryService.list().subscribe((categories) => (this.categories = categories));
    this.loadCourses();
  }

  selectCategory(categoryId: string | null) {
    this.selectedCategoryId = categoryId;
    this.loadCourses();
  }

  private loadCourses() {
    this.courseService
      .list(this.selectedCategoryId ?? undefined)
      .subscribe((courses) => (this.courses = courses));
  }
}
