import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const LANG_STORAGE_KEY = 'lang';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  template: `
    <div class="flex gap-1 text-sm">
      <button
        type="button"
        class="rounded px-1.5 py-0.5 transition"
        [class.font-bold]="translate.currentLang() === 'tr'"
        [class.text-accent-500]="translate.currentLang() === 'tr'"
        [class.text-white]="translate.currentLang() !== 'tr'"
        (click)="switchTo('tr')"
      >
        TR
      </button>
      <span class="text-white/40">|</span>
      <button
        type="button"
        class="rounded px-1.5 py-0.5 transition"
        [class.font-bold]="translate.currentLang() === 'en'"
        [class.text-accent-500]="translate.currentLang() === 'en'"
        [class.text-white]="translate.currentLang() !== 'en'"
        (click)="switchTo('en')"
      >
        EN
      </button>
    </div>
  `,
})
export class LanguageSwitcherComponent {
  constructor(public readonly translate: TranslateService) {}

  switchTo(lang: 'tr' | 'en') {
    this.translate.use(lang).subscribe();
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  }
}
