import { NgTemplateOutlet } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Course } from '../../core/models/course.model';
import { CourseService } from '../../core/services/course.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-deals',
  standalone: true,
  imports: [RouterLink, TranslatePipe, NgTemplateOutlet],
  template: `
    <section class="relative overflow-hidden bg-gradient-to-br from-brand-900 to-brand-800 text-white">
      <div class="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent-500/25 blur-3xl"></div>
      <div class="relative mx-auto max-w-5xl px-4 py-16 text-center">
        <span class="text-4xl">🎉</span>
        <h1 class="mt-3 text-3xl font-bold sm:text-4xl">{{ 'deals_page.title' | translate }}</h1>
        <p class="mx-auto mt-3 max-w-xl text-white/80">{{ 'deals_page.subtitle' | translate }}</p>
      </div>
    </section>

    <section class="mx-auto max-w-5xl px-4 py-14">
      @if (loading) {
        <p class="text-center text-sm text-slate-500">{{ 'deals_page.loading' | translate }}</p>
      } @else if (!udemyDeals.length && !instructorDeals.length) {
        <div class="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 py-16 text-center">
          <span class="text-4xl">🔍</span>
          <p class="text-sm text-slate-500">{{ 'deals_page.empty' | translate }}</p>
        </div>
      } @else {
        @if (udemyDeals.length) {
          <div>
            <h2 class="text-xl font-bold text-brand-900">{{ 'udemy_section.title' | translate }}</h2>
            <p class="mt-1 text-sm text-slate-600">{{ 'udemy_section.subtitle' | translate }}</p>
            <div class="mt-6 flex flex-col gap-5">
              @for (course of udemyDeals; track course.id) {
                <ng-container [ngTemplateOutlet]="dealCard" [ngTemplateOutletContext]="{ $implicit: course }" />
              }
            </div>
          </div>
        }

        @if (instructorDeals.length) {
          <div [class.mt-14]="udemyDeals.length">
            <h2 class="text-xl font-bold text-brand-900">{{ 'external_section.title' | translate }}</h2>
            <p class="mt-1 text-sm text-slate-600">{{ 'external_section.subtitle' | translate }}</p>
            <div class="mt-6 flex flex-col gap-5">
              @for (course of instructorDeals; track course.id) {
                <ng-container [ngTemplateOutlet]="dealCard" [ngTemplateOutletContext]="{ $implicit: course }" />
              }
            </div>
          </div>
        }
      }
    </section>

    <ng-template #dealCard let-course>
      <div class="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md sm:flex-row">
        <div class="relative aspect-video shrink-0 bg-slate-100 sm:aspect-square sm:w-56">
          @if (course.cover_image_url) {
            <img [src]="course.cover_image_url" class="h-full w-full object-cover" [alt]="course.title" />
          } @else {
            <div class="flex h-full items-center justify-center text-3xl">📘</div>
          }
          <span class="absolute left-2 top-2 rounded-full bg-brand-900 px-2 py-0.5 text-xs font-semibold text-white">
            {{ course.provider === 'udemy' ? 'Udemy' : course.platform_name || 'Harici' }}
          </span>
        </div>

        <div class="flex flex-1 flex-col justify-between gap-4 p-5">
          <div>
            <a [routerLink]="['/courses', course.slug]" class="font-semibold text-brand-900 hover:text-accent-600">
              {{ course.title }}
            </a>
            @if (course.short_description) {
              <p class="mt-1 line-clamp-2 text-sm text-slate-600">{{ course.short_description }}</p>
            }
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-baseline gap-2">
              @if (isFree(course)) {
                <span class="text-lg font-bold text-emerald-600">{{ 'course_card.free' | translate }}</span>
              } @else {
                @if (course.discount_price !== null && course.discount_price !== undefined) {
                  <span class="text-sm text-slate-400 line-through">{{ course.price }} ₺</span>
                  <span class="text-lg font-bold text-accent-600">{{ course.discount_price }} ₺</span>
                } @else {
                  <span class="text-lg font-bold text-brand-900">{{ course.price }} ₺</span>
                }
              }
            </div>

            <div class="flex items-center gap-2">
              @if (course.coupon_code) {
                <button
                  type="button"
                  class="flex items-center gap-2 rounded-full border border-dashed border-accent-500 bg-accent-500/10 px-3 py-1.5 text-xs font-semibold text-accent-700"
                  (click)="copyCoupon(course)"
                >
                  🎟️ {{ course.coupon_code }}
                  <span class="text-slate-400">{{ copiedId === course.id ? '✅' : '📋' }}</span>
                </button>
              }
              <a
                [href]="course.external_url"
                target="_blank"
                rel="noopener"
                class="rounded-full bg-accent-500 px-4 py-1.5 text-xs font-semibold text-brand-900 hover:bg-accent-600"
              >
                {{ 'deals_page.get_deal' | translate }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </ng-template>
  `,
})
export class DealsComponent implements OnInit {
  loading = true;
  udemyDeals: Course[] = [];
  instructorDeals: Course[] = [];
  copiedId: string | null = null;

  constructor(
    private readonly courseService: CourseService,
    private readonly seo: SeoService
  ) {}

  ngOnInit() {
    this.seo.setTitle('Fırsatlar');
    this.seo.setDescription('BilimData eğitmenlerinden özel indirim ve kupon fırsatları.');
    this.seo.setCanonical('/deals');
    this.courseService.list().subscribe({
      next: (courses) => {
        this.loading = false;
        this.udemyDeals = courses.filter(
          (c) => c.provider === 'udemy' && c.instructor?.is_platform_official !== false
        );
        this.instructorDeals = courses.filter(
          (c) => (c.provider === 'udemy' || c.provider === 'external') && c.instructor?.is_platform_official === false
        );
      },
      error: () => (this.loading = false),
    });
  }

  isFree(course: Course) {
    const effectivePrice =
      course.discount_price !== null && course.discount_price !== undefined ? course.discount_price : course.price;
    return effectivePrice === 0;
  }

  copyCoupon(course: Course) {
    if (!course.coupon_code) return;
    navigator.clipboard?.writeText(course.coupon_code).then(() => {
      this.copiedId = course.id;
      setTimeout(() => {
        if (this.copiedId === course.id) this.copiedId = null;
      }, 1500);
    });
  }
}
