import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { CtaButtonComponent } from '../cta-button/cta-button.component';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, AsyncPipe, TranslatePipe, CtaButtonComponent, LanguageSwitcherComponent],
  template: `
    <header class="sticky top-0 z-10 bg-brand-900 text-white shadow-md">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <a routerLink="/" class="text-lg font-bold">{{ 'header.logo' | translate }}</a>

        <nav class="hidden items-center gap-6 text-sm md:flex">
          <a routerLink="/courses" class="hover:text-accent-500">{{ 'nav.programs' | translate }}</a>
          <a routerLink="/" fragment="why-us" class="hover:text-accent-500">{{
            'nav.instructors' | translate
          }}</a>
          <a routerLink="/" fragment="advantages" class="hover:text-accent-500">{{
            'nav.deals' | translate
          }}</a>
          <a routerLink="/" fragment="footer" class="hover:text-accent-500">{{
            'nav.contact' | translate
          }}</a>
        </nav>

        <div class="flex items-center gap-3">
          <app-language-switcher />
          @if (session$ | async; as session) {
            <a routerLink="/dashboard" class="text-sm font-semibold hover:text-accent-500">{{
              'header.dashboard' | translate
            }}</a>
          } @else {
            <a routerLink="/auth/login" class="hidden text-sm hover:text-accent-500 sm:inline">{{
              'header.login' | translate
            }}</a>
            <app-cta-button
              [label]="'nav.register' | translate"
              routerLink="/auth/register"
              variant="primary"
            />
          }
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  readonly session$;

  constructor(private readonly supabase: SupabaseService) {
    this.session$ = this.supabase.session$;
  }
}
