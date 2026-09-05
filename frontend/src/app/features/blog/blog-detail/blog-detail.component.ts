import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { BlogComment, BlogPost } from '../../../core/models/blog.model';
import { BlogService } from '../../../core/services/blog.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { SeoService } from '../../../core/services/seo.service';
import { buildBlogPostingJsonLd } from '../../../core/utils/structured-data';

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [TranslatePipe, DatePipe, AsyncPipe, FormsModule, RouterLink],
  template: `
    @if (post) {
      <article class="mx-auto max-w-3xl px-4 py-12">
        @if (post.cover_image_url) {
          <img [src]="post.cover_image_url" [alt]="post.title" class="mb-6 w-full rounded-lg" />
        }
        @if (post.category) {
          <span class="text-xs font-semibold uppercase tracking-wide text-accent-600">{{
            post.category
          }}</span>
        }
        <h1 class="mt-2 text-3xl font-bold text-brand-900">{{ post.title }}</h1>
        <div class="mt-2 flex items-center gap-4">
          @if (post.published_at) {
            <p class="text-sm text-slate-400">{{ post.published_at | date: 'longDate' }}</p>
          }
          <button
            type="button"
            class="flex items-center gap-1 text-sm"
            [class.text-red-500]="likes.liked_by_me"
            [class.text-slate-400]="!likes.liked_by_me"
            (click)="toggleLike()"
          >
            {{ likes.liked_by_me ? '❤️' : '🤍' }} {{ likes.count }}
          </button>
        </div>

        @if (post.ai_summary) {
          <div class="mt-6 rounded-md border border-accent-500/30 bg-accent-500/10 p-4">
            <h2 class="text-sm font-semibold text-brand-900">{{ 'blog_page.ai_summary' | translate }}</h2>
            <p class="mt-1 text-sm text-slate-700">{{ post.ai_summary }}</p>
          </div>
        }

        @if (videoEmbedUrl) {
          <div class="mt-8 aspect-video w-full overflow-hidden rounded-lg bg-black">
            <iframe
              [src]="videoEmbedUrl"
              class="h-full w-full"
              title="video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        } @else if (post.video_url) {
          <p class="mt-6 text-sm">
            <a [href]="post.video_url" target="_blank" rel="noopener" class="font-semibold text-accent-600 underline">
              ▶ Videoyu İzle
            </a>
          </p>
        }

        <div
          class="rich-content mt-8 max-w-none whitespace-pre-line text-slate-700"
          [innerHTML]="post.content"
        ></div>

        @if (post.tags && post.tags.length) {
          <div class="mt-8 flex flex-wrap gap-2">
            @for (tag of post.tags; track tag) {
              <span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">#{{ tag }}</span>
            }
          </div>
        }

        <section class="mt-12 border-t border-slate-200 pt-8">
          <h2 class="text-lg font-bold text-brand-900">
            {{ 'blog_page.comments_title' | translate }} ({{ comments.length }})
          </h2>

          @if (session$ | async) {
            <form class="mt-4 flex flex-col gap-2" (ngSubmit)="submitComment()">
              <textarea
                class="rounded-md border border-slate-300 px-3 py-2 text-sm"
                rows="3"
                [(ngModel)]="newComment"
                name="newComment"
                [placeholder]="'blog_page.comment_placeholder' | translate"
              ></textarea>
              <button
                type="submit"
                [disabled]="!newComment.trim()"
                class="self-start rounded-md bg-accent-500 px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-accent-600 disabled:opacity-50"
              >
                {{ 'blog_page.comment_submit' | translate }}
              </button>
            </form>
          } @else {
            <p class="mt-4 text-sm text-slate-500">
              {{ 'blog_page.comment_login_required' | translate }}
              <a routerLink="/auth/login" class="font-semibold text-brand-900 underline">{{
                'header.login' | translate
              }}</a>
            </p>
          }

          <ul class="mt-6 flex flex-col gap-4">
            @for (comment of comments; track comment.id) {
              <li class="rounded-md border border-slate-100 bg-slate-50 p-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold text-brand-900">{{
                    comment.author?.full_name || 'Kullanıcı'
                  }}</span>
                  <span class="text-xs text-slate-400">{{ comment.created_at | date: 'short' }}</span>
                </div>
                <p class="mt-1 text-sm text-slate-700">{{ comment.content }}</p>
              </li>
            }
          </ul>
        </section>
      </article>
    } @else if (notFound) {
      <p class="mx-auto max-w-3xl px-4 py-12 text-center text-slate-500">
        {{ 'blog_page.not_found' | translate }}
      </p>
    }
  `,
})
export class BlogDetailComponent implements OnInit {
  post: BlogPost | null = null;
  notFound = false;
  comments: BlogComment[] = [];
  likes: { liked_by_me: boolean; count: number } = { liked_by_me: false, count: 0 };
  newComment = '';
  videoEmbedUrl: SafeResourceUrl | null = null;
  readonly session$;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly blogService: BlogService,
    private readonly supabase: SupabaseService,
    private readonly router: Router,
    private readonly sanitizer: DomSanitizer,
    private readonly seo: SeoService
  ) {
    this.session$ = this.supabase.session$;
  }

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.blogService.getBySlug(slug).subscribe({
      next: (post) => {
        this.post = post;
        this.blogService.getComments(post.id).subscribe((comments) => (this.comments = comments));
        this.blogService.getLikes(post.id).subscribe((likes) => (this.likes = likes));
        this.seo.setTitle(post.title);
        this.seo.setDescription(post.excerpt ?? post.ai_summary ?? '');
        this.seo.setImage(post.cover_image_url);
        this.seo.setCanonical(`/blog/${post.slug}`);
        this.seo.setJsonLd(buildBlogPostingJsonLd(post), 'blog-jsonld');
        if (post.video_url) {
          const youtubeId = extractYouTubeId(post.video_url);
          if (youtubeId) {
            this.videoEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
              `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`
            );
          }
        }
      },
      error: () => {
        this.notFound = true;
        this.seo.setTitle('Yazı bulunamadı');
      },
    });
  }

  toggleLike() {
    if (!this.post) return;
    if (!this.supabase.session$.value) {
      this.router.navigateByUrl('/auth/login');
      return;
    }
    this.blogService
      .toggleLike(this.post.id)
      .subscribe((result) => (this.likes = { liked_by_me: result.liked, count: result.count }));
  }

  submitComment() {
    if (!this.post || !this.newComment.trim()) return;
    this.blogService.addComment(this.post.id, this.newComment).subscribe((comment) => {
      this.comments = [...this.comments, comment];
      this.newComment = '';
    });
  }
}
