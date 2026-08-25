import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Course } from '../../../core/models/course.model';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <a
      [routerLink]="['/courses', course.slug]"
      class="relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      @if (course.provider === 'udemy') {
        <span class="absolute left-2 top-2 rounded-full bg-brand-900 px-2 py-0.5 text-xs font-semibold text-white">
          Udemy
        </span>
      }
      @if (course.cover_image_url) {
        <img [src]="course.cover_image_url" [alt]="course.title" class="h-40 w-full object-cover" />
      }
      <div class="flex flex-1 flex-col gap-2 p-4">
        <h3 class="font-semibold text-brand-900">{{ course.title }}</h3>
        @if (course.short_description) {
          <p class="line-clamp-2 flex-1 text-sm text-slate-600">{{ course.short_description }}</p>
        }
        <div class="flex items-baseline gap-2">
          @if (course.discount_price !== null && course.discount_price !== undefined) {
            <span class="text-sm text-slate-400 line-through">{{ course.price }} ₺</span>
            @if (course.discount_price === 0) {
              <span class="font-bold text-accent-600">{{ 'course_card.free' | translate }}</span>
            } @else {
              <span class="font-bold text-accent-600">{{ course.discount_price }} ₺</span>
            }
          } @else if (course.price === 0) {
            <span class="font-bold text-accent-600">{{ 'course_card.free' | translate }}</span>
          } @else {
            <span class="font-bold text-brand-900">{{ course.price }} ₺</span>
          }
        </div>
      </div>
    </a>
  `,
})
export class CourseCardComponent {
  @Input({ required: true }) course!: Course;
}
