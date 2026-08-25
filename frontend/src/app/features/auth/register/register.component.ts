import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { LogoComponent } from '../../../shared/components/logo/logo.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslatePipe, LogoComponent],
  template: `
    <section class="flex min-h-[calc(100vh-64px)] items-center justify-center bg-slate-50 px-4 py-12">
      <div class="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-lg md:grid-cols-2">
        <div class="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-900 to-brand-800 p-10 text-white md:flex">
          <div class="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent-500/25 blur-3xl"></div>
          <div class="relative">
            <app-logo />
          </div>
          <div class="relative">
            <span class="text-4xl">🚀</span>
            <h2 class="mt-4 text-2xl font-bold leading-snug">{{ 'auth.welcome_new_title' | translate }}</h2>
            <p class="mt-3 text-sm text-white/70">{{ 'auth.welcome_new_subtitle' | translate }}</p>
          </div>
          <p class="relative text-xs text-white/50">{{ 'footer.copyright' | translate }}</p>
        </div>

        <div class="p-8 sm:p-10">
          <h1 class="text-2xl font-bold text-brand-900">{{ 'auth.register_title' | translate }}</h1>
          <p class="mt-1 text-sm text-slate-500">{{ 'auth.register_subtitle' | translate }}</p>

          <button
            type="button"
            class="mt-6 flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            (click)="registerWithGoogle()"
            [disabled]="loading"
          >
            <svg viewBox="0 0 48 48" class="h-5 w-5">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.7 15.9 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.4 0-13.8 4.1-17.1 10.1z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.4C29.6 35.4 26.9 36.4 24 36.4c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.1 39.7 15.9 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.6 5.4C41.5 36 44 30.5 44 24c0-1.3-.1-2.4-.4-3.5z"
              />
            </svg>
            {{ 'auth.register_with_google' | translate }}
          </button>

          <div class="my-6 flex items-center gap-3 text-xs text-slate-400">
            <span class="h-px flex-1 bg-slate-200"></span>
            {{ 'auth.or_divider' | translate }}
            <span class="h-px flex-1 bg-slate-200"></span>
          </div>

          <form class="flex flex-col gap-4" (ngSubmit)="registerWithPassword()">
            <label class="flex flex-col gap-1 text-sm text-slate-700">
              {{ 'auth.full_name' | translate }}
              <div class="relative">
                <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🙂</span>
                <input
                  type="text"
                  name="fullName"
                  [(ngModel)]="fullName"
                  required
                  autocomplete="name"
                  class="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                />
              </div>
            </label>
            <label class="flex flex-col gap-1 text-sm text-slate-700">
              {{ 'auth.email' | translate }}
              <div class="relative">
                <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">📧</span>
                <input
                  type="email"
                  name="email"
                  [(ngModel)]="email"
                  required
                  autocomplete="email"
                  class="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                />
              </div>
            </label>
            <label class="flex flex-col gap-1 text-sm text-slate-700">
              {{ 'auth.password' | translate }}
              <div class="relative">
                <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔒</span>
                <input
                  type="password"
                  name="password"
                  [(ngModel)]="password"
                  required
                  minlength="6"
                  autocomplete="new-password"
                  class="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                />
              </div>
            </label>
            <label class="flex flex-col gap-1 text-sm text-slate-700">
              {{ 'auth.confirm_password' | translate }}
              <div class="relative">
                <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔒</span>
                <input
                  type="password"
                  name="confirmPassword"
                  [(ngModel)]="confirmPassword"
                  required
                  minlength="6"
                  autocomplete="new-password"
                  class="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                />
              </div>
            </label>
            <button
              type="submit"
              [disabled]="loading"
              class="mt-2 flex items-center justify-center gap-2 rounded-lg bg-accent-500 py-2.5 font-semibold text-brand-900 transition hover:bg-accent-600 disabled:opacity-50"
            >
              @if (loading) {
                <span class="h-4 w-4 animate-spin rounded-full border-2 border-brand-900/30 border-t-brand-900"></span>
              }
              {{ 'auth.register_button' | translate }}
            </button>
          </form>

          @if (errorMessage) {
            <p class="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              ⚠️ {{ errorMessage }}
            </p>
          }
          @if (infoMessage) {
            <p class="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              ✅ {{ infoMessage }}
            </p>
          }

          <p class="mt-6 text-center text-sm text-slate-600">
            {{ 'auth.have_account' | translate }}
            <a routerLink="/auth/login" class="font-semibold text-brand-900 hover:underline">{{
              'auth.login_link' | translate
            }}</a>
          </p>
        </div>
      </div>
    </section>
  `,
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  errorMessage = '';
  infoMessage = '';

  constructor(
    private readonly supabase: SupabaseService,
    private readonly router: Router,
    private readonly translate: TranslateService
  ) {}

  async registerWithPassword() {
    this.errorMessage = '';
    this.infoMessage = '';

    if (this.password !== this.confirmPassword) {
      this.translate.get('auth.password_mismatch').subscribe((text) => (this.errorMessage = text));
      return;
    }

    this.loading = true;
    const { data, error } = await this.supabase.client.auth.signUp({
      email: this.email,
      password: this.password,
      options: { data: { full_name: this.fullName } },
    });
    this.loading = false;

    if (error) {
      this.errorMessage = error.message;
      return;
    }
    if (!data.session) {
      this.translate.get('auth.verify_email_info').subscribe((text) => (this.infoMessage = text));
      return;
    }
    this.router.navigateByUrl('/dashboard');
  }

  async registerWithGoogle() {
    this.loading = true;
    this.errorMessage = '';
    const { error } = await this.supabase.signInWithGoogle();
    this.loading = false;
    if (error) {
      this.errorMessage = error.message;
    }
  }
}
