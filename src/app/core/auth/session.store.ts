import { computed, Injectable, signal } from '@angular/core';

import { Utente } from '../../shared/models/utente';

/** Stesse chiavi della versione legacy: chi era già loggato resta loggato dopo l'aggiornamento. */
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/** Sessione corrente, persistita in localStorage. */
@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly _token = signal<string | null>(readItem(TOKEN_KEY));
  private readonly _user = signal<Utente | null>(parseUser(readItem(USER_KEY)));

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._token() !== null);

  start(token: string, user: Utente): void {
    writeItem(TOKEN_KEY, token);
    writeItem(USER_KEY, JSON.stringify(user));
    this._token.set(token);
    this._user.set(user);
  }

  clear(): void {
    removeItem(TOKEN_KEY);
    removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
  }
}

// localStorage può non essere disponibile (es. navigazione privata di Safari): la sessione resta in memoria.
function readItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // sessione solo in memoria
  }
}

function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // niente da rimuovere
  }
}

function parseUser(json: string | null): Utente | null {
  if (!json) {
    return null;
  }
  try {
    const value: unknown = JSON.parse(json);
    return value && typeof value === 'object' ? (value as Utente) : null;
  } catch {
    return null;
  }
}
