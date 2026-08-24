import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <footer id="footer" class="bg-brand-900 text-white/80">
      <div
        class="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-sm sm:flex-row sm:justify-between"
      >
        <p>{{ 'footer.copyright' | translate }}</p>
        <div class="flex gap-4">
          <a href="#" class="hover:text-accent-500">{{ 'footer.privacy' | translate }}</a>
          <a href="#" class="hover:text-accent-500">{{ 'footer.terms' | translate }}</a>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
