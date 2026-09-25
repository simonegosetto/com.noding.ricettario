import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { SessionStore } from '../auth/session.store';
import { BusyService } from '../ui/busy.service';
import { GATEWAY_OPERATION, GatewayOperation } from './gateway-context';
import { GatewayError } from './gateway-error';
import { GatewayProcess } from './gateway-processes';
import { GatewayResponse, GatewayRow, LoginResponse } from './gateway-response';

/**
 * Il body è JSON ma l'header resta `application/x-www-form-urlencoded` come nella versione
 * legacy: la richiesta è "simple" e il browser non invia il preflight CORS, che il PHP non gestisce.
 */
const FORM_HEADERS = new HttpHeaders({ 'content-type': 'application/x-www-form-urlencoded' });

const SESSION_EXPIRED_MESSAGE = 'Sessione scaduta! Rifai l’accesso.';

/** Azioni del proxy Dropbox FD_DropboxGateway.php. */
export type DropboxAction =
  | { mode: 1; path: string; id: number; name: string; type: string; data: string }
  | { mode: 3; path: string }
  | { mode: 4; path: string };

const DROPBOX_OPERATIONS: Record<DropboxAction['mode'], GatewayOperation> = {
  1: { name: 'DROPBOX_UPLOAD', kind: 'write' },
  3: { name: 'DROPBOX_DELETE', kind: 'write' },
  4: { name: 'DROPBOX_LINK', kind: 'read' },
};

/** Sessione ottenuta da FD_Login.php. */
export interface LoginResult {
  token: string;
  user: GatewayRow;
}

/**
 * Unica porta HTTP verso il backend PHP. Mantiene il contratto della versione legacy:
 * POST `?gest=2` con `{type: 1, process, params, token}`.
 */
@Injectable({ providedIn: 'root' })
export class GatewayClient {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly busy = inject(BusyService);

  /** Esegue un process e restituisce la risposta completa. Gli errori arrivano come GatewayError. */
  call<R = GatewayRow, O = GatewayRow>(
    process: GatewayProcess,
    params = '',
  ): Observable<GatewayResponse<R, O>> {
    const body = { type: 1, process: process.id, params, token: this.session.token() };
    return this.post<GatewayResponse<R, O>>(environment.apiDBox, body, process).pipe(
      map((response) => this.checkGateway(response)),
    );
  }

  /** Righe del recordset (vuoto se assente). */
  rows<R = GatewayRow>(process: GatewayProcess, params = ''): Observable<R[]> {
    return this.call<R>(process, params).pipe(map((response) => response.recordset ?? []));
  }

  /** Prima riga del recordset. */
  first<R = GatewayRow>(process: GatewayProcess, params = ''): Observable<R | undefined> {
    return this.rows<R>(process, params).pipe(map((rows) => rows[0]));
  }

  /** Parametri OUT della stored procedure (`output[0]`). */
  output<O = GatewayRow>(process: GatewayProcess, params = ''): Observable<O | undefined> {
    return this.call<GatewayRow, O>(process, params).pipe(map((response) => response.output?.[0]));
  }

  /** Esegue un process di cui interessa solo l'esito. */
  exec(process: GatewayProcess, params = ''): Observable<void> {
    return this.call(process, params).pipe(map(() => undefined));
  }

  /** Chiamata al proxy Dropbox. */
  dropbox<T = GatewayRow>(action: DropboxAction): Observable<T> {
    const body = { action, token: this.session.token() };
    return this.post<T & { error?: unknown }>(
      environment.apiDropbox,
      body,
      DROPBOX_OPERATIONS[action.mode],
    ).pipe(
      map((response) => {
        // Il proxy Dropbox non segue la convenzione del gateway: errore solo se c'è un messaggio.
        if (typeof response?.error === 'string' && response.error) {
          throw new GatewayError(response.error);
        }
        return response;
      }),
    );
  }

  /** Autenticazione con il token applicativo statico. */
  login(username: string, password: string): Observable<LoginResult> {
    const body = { type: 1, username, password, token: environment.TOKEN };
    return this.post<LoginResponse>(environment.apiAuth, body, {
      name: 'LOGIN',
      kind: 'read',
    }).pipe(
      map((response) => {
        if (response && Object.hasOwn(response, 'error')) {
          throw new GatewayError(response.error || 'Credenziali non valide');
        }
        const token = response?.token?.token;
        const user = response?.user?.[0];
        if (!token || !user) {
          throw new GatewayError('Risposta di login non valida.');
        }
        return { token, user };
      }),
    );
  }

  private post<T>(url: string, body: object, operation: GatewayOperation): Observable<T> {
    return this.http
      .post<T>(`${url}?gest=2`, body, {
        headers: FORM_HEADERS,
        context: new HttpContext().set(GATEWAY_OPERATION, operation),
      })
      .pipe(
        catchError((error: unknown) => throwError(() => GatewayError.from(error))),
        this.busy.track(),
      );
  }

  private checkGateway<R, O>(response: GatewayResponse<R, O> | null): GatewayResponse<R, O> {
    if (!response) {
      return {};
    }
    // Come nella versione legacy: la sola presenza della chiave `error` indica un errore.
    if (Object.hasOwn(response, 'error')) {
      const message = response.error ?? '';
      if (message.toLowerCase().includes('token')) {
        this.expireSession();
        throw new GatewayError(SESSION_EXPIRED_MESSAGE, { sessionExpired: true });
      }
      throw new GatewayError(message || 'Errore generico');
    }
    return response;
  }

  private expireSession(): void {
    if (this.session.token() !== null) {
      this.session.clear();
      void this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }
}
