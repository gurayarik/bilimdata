import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { QuizDetail, QuizResult } from '../../../core/models/quiz.model';
import { QuizService } from '../../../core/services/quiz.service';

@Component({
  selector: 'app-course-quiz',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="mx-auto max-w-3xl px-4 py-10">
      <a [routerLink]="['/courses', slug]" class="text-sm font-semibold text-brand-900 hover:text-accent-600">
        ← Kursa Dön
      </a>

      @if (loading) {
        <p class="mt-6 text-sm text-slate-500">Sınav yükleniyor…</p>
      } @else if (lockedMessage) {
        <div class="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
          <p class="text-amber-800">{{ lockedMessage }}</p>
        </div>
      } @else if (quiz) {
        <h1 class="mt-4 text-2xl font-bold text-brand-900">🏆 {{ quiz.title }}</h1>

        @if (!result) {
          <p class="mt-2 text-sm text-slate-600">
            {{ quiz.questions.length }} sorudan oluşuyor. Tüm soruları cevaplayıp gönder.
          </p>

          <div class="mt-6 flex flex-col gap-6">
            @for (question of quiz.questions; track question.id; let qi = $index) {
              <div class="rounded-lg border border-slate-200 p-4">
                <p class="font-semibold text-brand-900">{{ qi + 1 }}. {{ question.question }}</p>
                <div class="mt-3 flex flex-col gap-2">
                  @for (option of question.options; track option; let oi = $index) {
                    <button
                      type="button"
                      class="rounded-md border px-3 py-2 text-left text-sm"
                      [class]="
                        answers[qi] === oi
                          ? 'border-accent-500 bg-accent-500/10 font-semibold text-brand-900'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      "
                      (click)="answers[qi] = oi"
                    >
                      {{ option }}
                    </button>
                  }
                </div>
              </div>
            }
          </div>

          @if (submitError) {
            <p class="mt-4 text-sm text-red-600">{{ submitError }}</p>
          }

          <button
            type="button"
            class="mt-6 rounded-md bg-accent-500 px-6 py-2.5 font-semibold text-brand-900 hover:bg-accent-600 disabled:opacity-50"
            [disabled]="!allAnswered() || submitting"
            (click)="submit()"
          >
            {{ submitting ? 'Gönderiliyor…' : 'Sınavı Gönder' }}
          </button>
        } @else {
          <div class="mt-6 rounded-lg border border-brand-900/10 bg-brand-900 p-6 text-center text-white">
            <p class="text-sm text-white/70">Sonucun</p>
            <p class="mt-1 text-3xl font-bold">{{ result.score }} / {{ result.total }}</p>
          </div>

          <div class="mt-6 flex flex-col gap-4">
            @for (item of result.results; track item.question_id; let qi = $index) {
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
            class="mt-6 rounded-md border border-slate-300 px-5 py-2.5 text-sm font-semibold text-brand-900 hover:bg-slate-50"
            (click)="retake()"
          >
            🔁 Sınavı Tekrar Çöz
          </button>
        }
      }
    </section>
  `,
})
export class CourseQuizComponent implements OnInit {
  slug = '';
  blockIndex = 0;
  loading = true;
  lockedMessage: string | null = null;
  quiz: QuizDetail | null = null;
  answers: number[] = [];
  submitting = false;
  submitError = '';
  result: QuizResult | null = null;

  constructor(private readonly route: ActivatedRoute, private readonly quizService: QuizService) {}

  ngOnInit() {
    this.slug = this.route.snapshot.paramMap.get('slug')!;
    this.blockIndex = Number(this.route.snapshot.paramMap.get('blockIndex'));
    this.loadQuiz();
  }

  private loadQuiz() {
    this.loading = true;
    this.lockedMessage = null;
    this.result = null;
    this.quizService.getQuiz(this.slug, this.blockIndex).subscribe({
      next: (quiz) => {
        this.loading = false;
        this.quiz = quiz;
        this.answers = new Array(quiz.questions.length).fill(-1);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.lockedMessage =
          err.error?.detail || 'Bu sınava şu an erişemiyorsun. Önce ilgili dersleri tamamlaman gerekiyor.';
      },
    });
  }

  allAnswered() {
    return this.answers.length > 0 && this.answers.every((a) => a >= 0);
  }

  submit() {
    if (!this.allAnswered()) return;
    this.submitting = true;
    this.submitError = '';
    this.quizService.submit(this.slug, this.blockIndex, this.answers).subscribe({
      next: (result) => {
        this.submitting = false;
        this.result = result;
      },
      error: () => {
        this.submitting = false;
        this.submitError = 'Sınav gönderilemedi, tekrar dener misin?';
      },
    });
  }

  retake() {
    this.result = null;
    this.answers = this.quiz ? new Array(this.quiz.questions.length).fill(-1) : [];
  }
}
