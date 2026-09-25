import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { authGuard, guestGuard } from './auth.guard';
import { SessionStore } from './session.store';

describe('authGuard / guestGuard', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  const run = (guard: typeof authGuard) => TestBed.runInInjectionContext(() => guard(route, state));

  it('senza sessione manda al login', () => {
    const result = run(authGuard);
    expect(result).toBeInstanceOf(UrlTree);
    expect(String(result)).toBe('/login');
  });

  it('con la sessione lascia passare', () => {
    TestBed.inject(SessionStore).start('tok', { nome: 'Mario' });
    expect(run(authGuard)).toBe(true);
  });

  it('riprende la sessione salvata dalla versione legacy', () => {
    localStorage.setItem('token', 'legacy');
    localStorage.setItem('user', JSON.stringify({ nome: 'Anna' }));
    expect(run(authGuard)).toBe(true);
    expect(TestBed.inject(SessionStore).user()).toEqual({ nome: 'Anna' });
  });

  it('dal login rimanda alla home chi è già autenticato', () => {
    TestBed.inject(SessionStore).start('tok', {});
    expect(String(run(guestGuard))).toBe('/home');
  });
});
