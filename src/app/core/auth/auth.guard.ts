import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SessionStore } from './session.store';

/** Protegge le pagine riservate: senza sessione si va al login. */
export const authGuard: CanActivateFn = () =>
  inject(SessionStore).isLoggedIn() || inject(Router).createUrlTree(['/login']);

/** Il login non serve a chi ha già una sessione. */
export const guestGuard: CanActivateFn = () =>
  !inject(SessionStore).isLoggedIn() || inject(Router).createUrlTree(['/home']);
