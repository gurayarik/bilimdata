import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslatePipe],
  template: `
    <section class="mx-auto max-w-sm px-4 py-16">
      <h1 class="text-2xl font-bold text-brand-900">{{ 'auth.register_title' | translate }}</h1>

      <button
        type="button"
        class="mt-6 w-full rounded-md border border-slate-300 py-2.5 font-semibold text-brand-900 hover:bg-slate-50"
        (click)="registerWithGoogle()"
        [disabled]="loading"
      >
        {{ 'auth.register_with_google' | translate }}
      </button>

      <form class="mt-6 flex flex-col gap-4" (ngSubmit)="registerWithPassword()">
        <label class="flex flex-col gap-1 text-sm text-slate-700">
          {{ 'auth.full_name' | translate }}
          <input
            type="text"
            name="fullName"
            [(ngModel)]="fullName"
            required
            autocomplete="name"
            class="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm text-slate-700">
          {{ 'auth.email' | translate }}
          <input
            type="email"
            name="email"
            [(ngModel)]="email"
            required
            autocomplete="email"
            class="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <label class="flex flex-col gap-1 text-sm text-slate-700">
          {{ 'auth.password' | translate }}
          <input
            type="password"
            name="password"
            [(ngModel)]="password"
            required
            minlength="6"
            autocomplete="new-password"
            class="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          [disabled]="loading"
          class="rounded-md bg-accent-500 py-2.5 font-semibold text-brand-900 hover:bg-accent-600"
        >
          {{ 'auth.register_button' | translate }}
        </button>
      </form>

      @if (errorMessage) {
        <p class="mt-4 text-sm text-red-600">{{ errorMessage }}</p>
      }
      @if (infoMessage) {
        <p class="mt-4 text-sm text-emerald-600">{{ infoMessage }}</p>
      }

      <p class="mt-6 text-center text-sm text-slate-600">
        {{ 'auth.have_account' | translate }}
        <a routerLink="/auth/login" class="font-semibold text-brand-900 hover:underline">{{
          'auth.login_link' | translate
        }}</a>
      </p>
    </section>
  `,
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  loading = false;
  errorMessage = '';
  infoMessage = '';

  constructor(
    private readonly supabase: SupabaseService,
    private readonly router: Router,
    private readonly translate: TranslateService
  ) {}

  async registerWithPassword() {
    this.loading = true;
    this.errorMessage = '';
    this.infoMessage = '';

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
