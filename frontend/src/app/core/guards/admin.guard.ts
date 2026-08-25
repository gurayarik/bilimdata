import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { ProfileService } from '../services/profile.service';

export const adminGuard: CanActivateFn = () => {
  const profileService = inject(ProfileService);
  const router = inject(Router);

  return profileService.getMine().pipe(
    map((profile) => (profile.role === 'admin' ? true : router.createUrlTree(['/dashboard']))),
    catchError(() => of(router.createUrlTree(['/dashboard'])))
  );
};
