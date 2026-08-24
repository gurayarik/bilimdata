import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Profile, ProfileService } from '../../core/services/profile.service';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <section class="mx-auto max-w-3xl px-4 py-12">
      <h1 class="text-2xl font-bold text-brand-900">{{ 'dashboard.title' | translate }}</h1>
      @if (profile) {
        <p class="mt-2 text-slate-700">
          {{
            'dashboard.welcome'
              | translate: { name: profile.full_name || ('dashboard.welcome_fallback' | translate) }
          }}
        </p>
      }
      <button
        type="button"
        class="mt-6 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-slate-50"
        (click)="signOut()"
      >
        {{ 'dashboard.sign_out' | translate }}
      </button>
      <p class="mt-8 text-sm text-slate-500">{{ 'dashboard.progress_placeholder' | translate }}</p>
    </section>
  `,
})
export class DashboardComponent implements OnInit {
  profile: Profile | null = null;

  constructor(
    private readonly profileService: ProfileService,
    private readonly supabase: SupabaseService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.profileService.getMine().subscribe((profile) => (this.profile = profile));
  }

  async signOut() {
    await this.supabase.signOut();
    this.router.navigateByUrl('/');
  }
}
