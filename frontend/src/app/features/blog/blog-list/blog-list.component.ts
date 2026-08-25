import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BlogPost } from '../../../core/models/blog.model';
import { BlogService } from '../../../core/services/blog.service';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, DatePipe, AsyncPipe],
  template: `
    <section class="mx-auto max-w-6xl px-4 py-12">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-brand-900">{{ 'blog_page.title' | translate }}</h1>
        @if (session$ | async) {
          <a routerLink="/blog/write" class="text-sm font-semibold text-brand-900 hover:underline">
            {{ 'blog_page.write_link' | translate }}
          </a>
        }
      </div>

      @if (posts.length === 0) {
        <p class="mt-10 text-center text-slate-500">{{ 'blog_page.empty' | translate }}</p>
      } @else {
        <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          @for (post of posts; track post.id) {
            <a
              [routerLink]="['/blog', post.slug]"
              class="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              @if (post.cover_image_url) {
                <img [src]="post.cover_image_url" [alt]="post.title" class="h-40 w-full object-cover" />
              }
              <div class="flex flex-1 flex-col gap-2 p-4">
                @if (post.category) {
                  <span class="text-xs font-semibold uppercase tracking-wide text-accent-600">{{
                    post.category
                  }}</span>
                }
                <h3 class="font-semibold text-brand-900">{{ post.title }}</h3>
                @if (post.excerpt) {
                  <p class="line-clamp-3 flex-1 text-sm text-slate-600">{{ post.excerpt }}</p>
                }
                @if (post.published_at) {
                  <span class="text-xs text-slate-400">{{ post.published_at | date: 'longDate' }}</span>
                }
              </div>
            </a>
          }
        </div>
      }
    </section>
  `,
})
export class BlogListComponent implements OnInit {
  posts: BlogPost[] = [];
  readonly session$;

  constructor(
    private readonly blogService: BlogService,
    private readonly supabase: SupabaseService
  ) {
    this.session$ = this.supabase.session$;
  }

  ngOnInit() {
    this.blogService.list().subscribe((posts) => (this.posts = posts));
  }
}
