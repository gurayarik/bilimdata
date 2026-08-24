import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideTranslateService } from '@ngx-translate/core';

import { routes } from './app.routes';
import { authInterceptor } from './core/services/auth.interceptor';

const SUPPORTED_LANGS = ['tr', 'en'] as const;

function resolveInitialLang(): 'tr' | 'en' {
  const stored = localStorage.getItem('lang');
  if (stored && (SUPPORTED_LANGS as readonly string[]).includes(stored)) {
    return stored as 'tr' | 'en';
  }
  return 'tr';
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideTranslateService({
      fallbackLang: 'tr',
      lang: resolveInitialLang(),
      loader: provideTranslateHttpLoader({ prefix: '/assets/i18n/', suffix: '.json' }),
    }),
  ],
};
