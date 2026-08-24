import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly client: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey
  );

  readonly session$ = new BehaviorSubject<Session | null>(null);
  /** OAuth yönlendirmesi sonrası vs. — SIGNED_IN gibi olayları ayrıca yayınlar. */
  readonly authEvent$ = new Subject<AuthChangeEvent>();

  constructor() {
    this.client.auth.getSession().then(({ data }) => this.session$.next(data.session));
    this.client.auth.onAuthStateChange((event, session) => {
      this.session$.next(session);
      this.authEvent$.next(event);
    });
  }

  signInWithGoogle() {
    return this.client.auth.signInWithOAuth({ provider: 'google' });
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
