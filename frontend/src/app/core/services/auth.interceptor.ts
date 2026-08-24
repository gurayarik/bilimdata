import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(SupabaseService).accessToken;
  if (!token) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
