import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';

import { Utente } from '../../shared/models/utente';
import { GatewayClient } from '../api/gateway.client';
import { SessionStore } from './session.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly gateway = inject(GatewayClient);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);

  readonly user = this.session.user;
  readonly isLoggedIn = this.session.isLoggedIn;

  login(username: string, password: string): Observable<Utente> {
    return this.gateway.login(username, password).pipe(
      map(({ token, user }) => ({ token, user: user as Utente })),
      tap(({ token, user }) => this.session.start(token, user)),
      map(({ user }) => user),
    );
  }

  /** Il logout è solo locale, come nella versione legacy. */
  logout(): void {
    this.session.clear();
    void this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
