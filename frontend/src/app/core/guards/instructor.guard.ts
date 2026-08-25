import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ProfileService } from '../services/profile.service';

export const instructorGuard: CanActivateFn = () => {
  const profileService = inject(ProfileService);
  const router = inject(Router);

  return profileService.getMine().pipe(
    map((profile) =>
      profile.role === 'instructor' || profile.role === 'admin'
        ? true
        : router.createUrlTree(['/dashboard'])
    ),
    catchError(() => of(router.createUrlTree(['/dashboard'])))
  );
};
