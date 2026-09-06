import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LearningPathDetail, PathArticle } from '../../../core/models/path.model';
import { QuizDetail, QuizResult } from '../../../core/models/quiz.model';
import { PathService } from '../../../core/services/path.service';
import { QuizService } from '../../../core/services/quiz.service';
import { SeoService } from '../../../core/services/seo.service';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-path-detail',
  standalone: true,
  imports: [RouterLink, TranslatePipe, AsyncPipe],
  template: `
    @if (path && activeArticle) {
      <div class="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-10 md:grid-cols-3">
        <aside class="md:col-span-1">
          <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h1 class="text-lg font-bold text-brand-900">{{ path.title }}</h1>
            @if (path.description) {
              <p class="mt-2 text-sm text-slate-600">{{ path.description }}</p>
            }

            @if (session$ | async) {
              <div class="mt-4">
                <div class="flex items-center justify-between text-xs text-slate-500">
                  <span>İlerleme</span>
                  <span>{{ completedArticleIds.size }} / {{ path.articles.length }}</span>
                </div>
                <div class="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div class="h-full rounded-full bg-accent-500" [style.width.%]="progressPercent"></div>
                </div>
              </div>
            }

            <nav class="mt-5 flex flex-col gap-1">
              @for (article of path.articles; track article.id; let i = $index) {
                <a
                  [routerLink]="['/paths', path.slug, article.slug]"
                  class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition"
                  [class.bg-accent-500]="article.id === activeArticle.id"
                  [class.text-brand-900]="article.id === activeArticle.id"
                  [class.font-semibold]="article.id === activeArticle.id"
                  [class.text-slate-600]="article.id !== activeArticle.id"
                  [class.hover:bg-slate-50]="article.id !== activeArticle.id"
                >
                  <span
                    class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs"
                    [class.bg-emerald-500]="completedArticleIds.has(article.id) && article.id !== activeArticle.id"
                    [class.text-white]="
                      completedArticleIds.has(article.id) || article.id === activeArticle.id
                    "
                    [class.bg-brand-900]="article.id === activeArticle.id"
                    [class.bg-slate-100]="!completedArticleIds.has(article.id) && article.id !== activeArticle.id"
                  >
                    {{ completedArticleIds.has(article.id) ? '✓' : i + 1 }}
                  </span>
                  {{ article.title }}
                </a>
              }
            </nav>
          </div>
        </aside>

        <article class="md:col-span-2">
          @if (progressPercent === 100 && (session$ | async)) {
            <div class="mb-6 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 p-5 text-center font-semibold text-brand-900">
              🎉 Bu yol haritasını tamamladın!
            </div>
          }

          <h2 class="text-2xl font-bold text-brand-900">{{ activeArticle.title }}</h2>
          <div class="rich-content mt-6 max-w-none text-slate-700" [innerHTML]="activeArticle.content"></div>

          <div class="mt-8 flex items-center gap-4 border-t border-slate-200 pt-6">
            @if (session$ | async) {
              <button
                type="button"
                class="rounded-full px-5 py-2.5 text-sm font-semibold transition"
                [class]="
                  isActiveCompleted()
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'border border-accent-500 text-accent-600 hover:bg-accent-500/10'
                "
                [disabled]="markingComplete"
                (click)="toggleComplete()"
              >
                {{ isActiveCompleted() ? '✅ Tamamlandı' : 'Bu Dersi Tamamladım' }}
              </button>
            } @else {
              <p class="text-sm text-slate-500">İlerlemeni kaydetmek için giriş yap.</p>
            }
          </div>

          <section class="mt-8 rounded-2xl border border-accent-500/30 bg-accent-500/5 p-6">
            @if (!quizStarted) {
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 class="font-semibold text-brand-900">🧠 Bu konudaki bilgini test et</h3>
                  <p class="mt-1 text-sm text-slate-600">10 soruluk kısa bir sınav ile öğrendiklerini pekiştir.</p>
                </div>
                <button
                  type="button"
                  class="shrink-0 rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-brand-900 hover:bg-accent-600"
                  (click)="startQuiz()"
                >
                  Sınavı Başlat
                </button>
              </div>
              @if (quizError) {
                <p class="mt-3 text-sm text-red-600">{{ quizError }}</p>
              }
            } @else if (quizLoading) {
              <p class="text-sm text-slate-500">Sınav hazırlanıyor…</p>
            } @else if (quiz && !quizResult) {
              <h3 class="font-semibold text-brand-900">🧠 {{ quiz.title }}</h3>
              <div class="mt-4 flex flex-col gap-5">
                @for (question of quiz.questions; track question.id; let qi = $index) {
                  <div class="rounded-lg border border-slate-200 bg-white p-4">
                    <p class="font-semibold text-brand-900">{{ qi + 1 }}. {{ question.question }}</p>
                    <div class="mt-3 flex flex-col gap-2">
                      @for (option of question.options; track option; let oi = $index) {
                        <button
                          type="button"
                          class="rounded-md border px-3 py-2 text-left text-sm"
                          [class]="
                            quizAnswers[qi] === oi
                              ? 'border-accent-500 bg-accent-500/10 font-semibold text-brand-900'
                              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          "
                          (click)="quizAnswers[qi] = oi"
                        >
                          {{ option }}
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>

              @if (quizSubmitError) {
                <p class="mt-4 text-sm text-red-600">{{ quizSubmitError }}</p>
              }

              <button
                type="button"
                class="mt-6 rounded-full bg-accent-500 px-6 py-2.5 text-sm font-semibold text-brand-900 hover:bg-accent-600 disabled:opacity-50"
                [disabled]="!allQuizAnswered() || quizSubmitting"
                (click)="submitQuiz()"
              >
                {{ quizSubmitting ? 'Gönderiliyor…' : 'Sınavı Gönder' }}
              </button>
            } @else if (quizResult) {
              <div class="rounded-lg bg-brand-900 p-6 text-center text-white">
                <p class="text-sm text-white/70">Sonucun</p>
                <p class="mt-1 text-3xl font-bold">{{ quizResult.score }} / {{ quizResult.total }}</p>
                @if (!(session$ | async)) {
                  <p class="mt-2 text-xs text-white/60">Giriş yaparsan sonuçların kaydedilir.</p>
                }
              </div>

              <div class="mt-6 flex flex-col gap-3">
                @for (item of quizResult.results; track item.question_id; let qi = $index) {
                  <div
                    class="rounded-lg border p-4"
                    [class]="item.correct ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'"
                  >
                    <p class="font-semibold text-brand-900">
                      {{ qi + 1 }}. {{ item.question }} {{ item.correct ? '✅' : '❌' }}
                    </p>
                    <p class="mt-2 text-sm text-slate-700">Cevabın: {{ item.options[item.selected_index] }}</p>
                    @if (!item.correct) {
                      <p class="mt-1 text-sm font-semibold text-emerald-700">
                        Doğru cevap: {{ item.options[item.correct_index] }}
                      </p>
                    }
                  </div>
                }
              </div>

              <button
                type="button"
                class="mt-6 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-brand-900 hover:bg-white"
                (click)="retakeQuiz()"
              >
                🔁 Sınavı Tekrar Çöz
              </button>
            }
          </section>
        </article>
      </div>
    } @else if (notFound) {
      <p class="mx-auto max-w-3xl px-4 py-12 text-center text-slate-500">
        {{ 'paths_page.not_found' | translate }}
      </p>
    }
  `,
})
export class PathDetailComponent implements OnInit {
  path: LearningPathDetail | null = null;
  activeArticle: PathArticle | null = null;
  notFound = false;
  readonly session$;

  completedArticleIds = new Set<string>();
  progressPercent = 0;
  markingComplete = false;

  quizStarted = false;
  quizLoading = false;
  quizError = '';
  quiz: QuizDetail | null = null;
  quizAnswers: number[] = [];
  quizSubmitting = false;
  quizSubmitError = '';
  quizResult: QuizResult | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly pathService: PathService,
    private readonly quizService: QuizService,
    private readonly seo: SeoService,
    private readonly supabase: SupabaseService
  ) {
    this.session$ = this.supabase.session$;
  }

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.pathService.getBySlug(slug).subscribe({
      next: (path) => {
        this.path = path;
        this.loadProgress();
        this.route.paramMap.subscribe((params) => {
          const articleSlug = params.get('articleSlug');
          const article =
            path.articles.find((a) => a.slug === articleSlug) ?? path.articles[0] ?? null;
          this.activeArticle = article;
          this.resetQuiz();
          if (article) {
            this.seo.setTitle(`${article.title} — ${path.title}`);
            this.seo.setDescription(path.description ?? '');
            this.seo.setCanonical(`/paths/${path.slug}/${article.slug}`);
          }
        });
      },
      error: () => {
        this.notFound = true;
        this.seo.setTitle('Yol haritası bulunamadı');
      },
    });
  }

  loadProgress() {
    if (!this.path || !this.supabase.session$.value) return;
    this.pathService.getMyProgress(this.path.slug).subscribe((progress) => {
      this.completedArticleIds = new Set(progress.completed_article_ids);
      this.progressPercent = progress.progress_percent;
    });
  }

  isActiveCompleted() {
    return !!this.activeArticle && this.completedArticleIds.has(this.activeArticle.id);
  }

  toggleComplete() {
    if (!this.path || !this.activeArticle) return;
    this.markingComplete = true;
    const nextCompleted = !this.isActiveCompleted();
    this.pathService
      .markArticleComplete(this.path.slug, this.activeArticle.slug, nextCompleted)
      .subscribe({
        next: (progress) => {
          this.markingComplete = false;
          this.completedArticleIds = new Set(progress.completed_article_ids);
          this.progressPercent = progress.progress_percent;
        },
        error: () => (this.markingComplete = false),
      });
  }

  resetQuiz() {
    this.quizStarted = false;
    this.quizLoading = false;
    this.quizError = '';
    this.quiz = null;
    this.quizAnswers = [];
    this.quizSubmitting = false;
    this.quizSubmitError = '';
    this.quizResult = null;
  }

  startQuiz() {
    if (!this.path || !this.activeArticle) return;
    this.quizStarted = true;
    this.quizLoading = true;
    this.quizError = '';
    this.quizService.getPathArticleQuiz(this.path.slug, this.activeArticle.slug).subscribe({
      next: (quiz) => {
        this.quizLoading = false;
        this.quiz = quiz;
        this.quizAnswers = new Array(quiz.questions.length).fill(-1);
      },
      error: () => {
        this.quizLoading = false;
        this.quizStarted = false;
        this.quizError = 'Sınav hazırlanamadı, tekrar dener misin?';
      },
    });
  }

  allQuizAnswered() {
    return this.quizAnswers.length > 0 && this.quizAnswers.every((a) => a >= 0);
  }

  submitQuiz() {
    if (!this.path || !this.activeArticle || !this.allQuizAnswered()) return;
    this.quizSubmitting = true;
    this.quizSubmitError = '';
    this.quizService
      .submitPathArticleQuiz(this.path.slug, this.activeArticle.slug, this.quizAnswers)
      .subscribe({
        next: (result) => {
          this.quizSubmitting = false;
          this.quizResult = result;
        },
        error: () => {
          this.quizSubmitting = false;
          this.quizSubmitError = 'Sınav gönderilemedi, tekrar dener misin?';
        },
      });
  }

  retakeQuiz() {
    this.quizResult = null;
    this.quizAnswers = this.quiz ? new Array(this.quiz.questions.length).fill(-1) : [];
  }
}
