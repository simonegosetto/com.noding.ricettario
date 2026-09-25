import { HttpInterceptorFn } from '@angular/common/http';
import { inject, InjectionToken } from '@angular/core';
import { throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { GATEWAY_OPERATION } from './gateway-context';
import { GatewayError } from './gateway-error';

/** Modalità sola lettura: di default quella dell'environment (attiva in development). */
export const READ_ONLY = new InjectionToken<boolean>('READ_ONLY', {
  providedIn: 'root',
  factory: () => environment.readOnly,
});

/**
 * Non esiste un ambiente di test: in sviluppo si lavora sui dati di produzione. In sola lettura
 * le scritture (process `write`, upload e cancellazioni Dropbox) non partono e la chiamata
 * fallisce con un messaggio esplicito; letture, login e stampe passano.
 */
export const readOnlyInterceptor: HttpInterceptorFn = (request, next) => {
  const operation = request.context.get(GATEWAY_OPERATION);
  if (operation?.kind === 'write' && inject(READ_ONLY)) {
    return throwError(
      () =>
        new GatewayError(
          `Modalità sola lettura: ${operation.name} non è stato inviato al server.`,
          { readOnly: true },
        ),
    );
  }
  return next(request);
};
