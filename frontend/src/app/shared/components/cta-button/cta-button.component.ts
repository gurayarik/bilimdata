import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cta-button',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a
      [routerLink]="routerLink"
      [class]="
        variant === 'primary'
          ? 'inline-block rounded-md bg-accent-500 px-5 py-2.5 font-semibold text-brand-900 transition hover:bg-accent-600'
          : 'inline-block rounded-md border border-white/30 px-5 py-2.5 font-semibold text-white transition hover:bg-white/10'
      "
    >
      {{ label }}
    </a>
  `,
})
export class CtaButtonComponent {
  @Input() label = '';
  @Input() routerLink = '/';
  @Input() variant: 'primary' | 'secondary' = 'primary';
}
