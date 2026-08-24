import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslatePipe],
  template: `
    <section class="mx-auto max-w-sm px-4 py-16">
      <h1 class="text-2xl font-bold text-brand-900">{{ 'auth.login_title' | translate }}</h1>

      <button
        type="button"
        class="mt-6 w-full rounded-md border border-slate-300 py-2.5 font-semibold text-brand-900 hover:bg-slate-50"
        (click)="loginWithGoogle()"
        [disabled]="loading"
      >
        {{ 'auth.login_with_google' | translate }}
      </button>

      <form class="mt-6 flex flex-col gap-4" (ngSubmit)="loginWithPassword()">
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
            autocomplete="current-password"
            class="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          [disabled]="loading"
          class="rounded-md bg-accent-500 py-2.5 font-semibold text-brand-900 hover:bg-accent-600"
        >
          {{ 'auth.login_button' | translate }}
        </button>
      </form>

      @if (errorMessage) {
        <p class="mt-4 text-sm text-red-600">{{ errorMessage }}</p>
      }

      <p class="mt-6 text-center text-sm text-slate-600">
        {{ 'auth.no_account' | translate }}
        <a routerLink="/auth/register" class="font-semibold text-brand-900 hover:underline">{{
          'auth.register_link' | translate
        }}</a>
      </p>
    </section>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private readonly supabase: SupabaseService,
    private readonly router: Router
  ) {}

  async loginWithPassword() {
    this.loading = true;
    this.errorMessage = '';
    const { error } = await this.supabase.signInWithPassword(this.email, this.password);
    this.loading = false;
    if (error) {
      this.errorMessage = error.message;
      return;
    }
    this.router.navigateByUrl('/dashboard');
  }

  async loginWithGoogle() {
    this.loading = true;
    this.errorMessage = '';
    const { error } = await this.supabase.signInWithGoogle();
    this.loading = false;
    if (error) {
      this.errorMessage = error.message;
    }
    // Başarılıysa Supabase kullanıcıyı Google'a yönlendirir; dönüşte session
    // supabase-js tarafından otomatik alınır (detectSessionInUrl varsayılan true).
  }
}
