import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient;
  private readonly isBrowser: boolean;

  readonly session$ = new BehaviorSubject<Session | null>(null);
  /** OAuth yönlendirmesi sonrası vs. — SIGNED_IN gibi olayları ayrıca yayınlar. */
  readonly authEvent$ = new Subject<AuthChangeEvent>();

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.client = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
      auth: {
        persistSession: this.isBrowser,
        autoRefreshToken: this.isBrowser,
        detectSessionInUrl: this.isBrowser,
      },
      // SSR'da (Node 20) native WebSocket global'i yok; Realtime client'ın
      // constructor sırasında bunu araması crash'e yol açıyor. Server'da
      // gerçek bağlantı hiç kurulmadığından, no-op bir transport vermek yeterli.
      ...(this.isBrowser ? {} : { realtime: { transport: class {} as any } }),
    });

    if (this.isBrowser) {
      this.client.auth.getSession().then(({ data }) => this.session$.next(data.session));
      this.client.auth.onAuthStateChange((event, session) => {
        this.session$.next(session);
        this.authEvent$.next(event);
      });
    }
  }

  signInWithGoogle() {
    return this.client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: this.isBrowser ? window.location.origin : environment.siteBaseUrl },
    });
  }

  signInWithPassword(email: string, password: string) {
    return this.client.auth.signInWithPassword({ email, password });
  }

  signUp(email: string, password: string) {
    return this.client.auth.signUp({ email, password });
  }

  signOut() {
    return this.client.auth.signOut();
  }

  get accessToken(): string | null {
    return this.session$.value?.access_token ?? null;
  }
}
