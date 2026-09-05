import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ContactService } from '../../core/services/contact.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  template: `
    <section class="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 to-brand-800 px-6 py-8 text-white shadow-md sm:px-8">
        <div class="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent-500/20 blur-3xl"></div>
        <div class="relative">
          <p class="text-xs font-semibold uppercase tracking-wide text-white/60">BilimData</p>
          <h1 class="mt-1 text-2xl font-bold sm:text-3xl">{{ 'contact_page.title' | translate }}</h1>
          <p class="mt-2 text-sm text-white/70">{{ 'contact_page.subtitle' | translate }}</p>
        </div>
      </div>

      <div class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        @if (submitted) {
          <div class="flex flex-col items-center gap-3 py-10 text-center">
            <span class="text-4xl">✅</span>
            <h2 class="text-lg font-bold text-brand-900">{{ 'contact_page.success_title' | translate }}</h2>
            <p class="max-w-md text-sm text-slate-500">{{ 'contact_page.success_body' | translate }}</p>
            <button
              type="button"
              class="mt-2 rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold hover:bg-slate-50"
              (click)="submitted = false"
            >
              {{ 'contact_page.send_another' | translate }}
            </button>
          </div>
        } @else {
          <form class="flex flex-col gap-4" (ngSubmit)="submit()">
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label class="flex flex-col gap-1 text-sm">
                {{ 'contact_page.name' | translate }}
                <input
                  class="rounded-md border border-slate-300 px-3 py-2"
                  [(ngModel)]="name"
                  name="name"
                  required
                />
              </label>
              <label class="flex flex-col gap-1 text-sm">
                {{ 'contact_page.email' | translate }}
                <input
                  type="email"
                  class="rounded-md border border-slate-300 px-3 py-2"
                  [(ngModel)]="email"
                  name="email"
                  required
                />
              </label>
            </div>
            <label class="flex flex-col gap-1 text-sm">
              {{ 'contact_page.subject' | translate }}
              <input
                class="rounded-md border border-slate-300 px-3 py-2"
                [(ngModel)]="subject"
                name="subject"
                [placeholder]="'contact_page.subject_placeholder' | translate"
              />
            </label>
            <label class="flex flex-col gap-1 text-sm">
              {{ 'contact_page.message' | translate }}
              <textarea
                class="rounded-md border border-slate-300 px-3 py-2"
                rows="6"
                [(ngModel)]="message"
                name="message"
                required
              ></textarea>
            </label>

            @if (errorMessage) {
              <p class="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                ⚠️ {{ errorMessage }}
              </p>
            }

            <button
              type="submit"
              [disabled]="loading"
              class="mt-2 flex items-center justify-center gap-2 self-start rounded-full bg-accent-500 px-6 py-2.5 text-sm font-semibold text-brand-900 hover:bg-accent-600 disabled:opacity-50"
            >
              @if (loading) {
                <span class="h-4 w-4 animate-spin rounded-full border-2 border-brand-900/30 border-t-brand-900"></span>
              }
              {{ 'contact_page.send' | translate }}
            </button>
          </form>
        }
      </div>
    </section>
  `,
})
export class ContactComponent implements OnInit {
  name = '';
  email = '';
  subject = '';
  message = '';
  loading = false;
  submitted = false;
  errorMessage = '';

  constructor(
    private readonly contactService: ContactService,
    private readonly supabase: SupabaseService,
    private readonly translate: TranslateService,
    private readonly seo: SeoService
  ) {}

  ngOnInit() {
    this.seo.setTitle('İletişim');
    this.seo.setDescription('BilimData ile iletişime geçin — sorularınızı bize iletin.');
    this.seo.setCanonical('/contact');
    const session = this.supabase.session$.value;
    if (session?.user) {
      this.email = session.user.email ?? '';
      this.name = (session.user.user_metadata?.['full_name'] as string) ?? '';
    }
  }

  submit() {
    if (!this.name.trim() || !this.email.trim() || !this.message.trim()) return;
    this.errorMessage = '';
    this.loading = true;
    this.contactService
      .submit({
        name: this.name,
        email: this.email,
        subject: this.subject || undefined,
        message: this.message,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.submitted = true;
          this.subject = '';
          this.message = '';
        },
        error: () => {
          this.loading = false;
          this.translate.get('contact_page.error').subscribe((text) => (this.errorMessage = text));
        },
      });
  }
}
