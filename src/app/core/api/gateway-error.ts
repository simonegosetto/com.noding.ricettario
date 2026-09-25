import { HttpErrorResponse } from '@angular/common/http';

interface GatewayErrorOptions {
  /** Il backend ha rifiutato il token: la sessione è stata chiusa. */
  sessionExpired?: boolean;
  /** Scrittura bloccata dalla modalità sola lettura. */
  readOnly?: boolean;
  status?: number;
  cause?: unknown;
}

/** Errore normalizzato di tutte le chiamate al backend PHP. */
export class GatewayError extends Error {
  override readonly name = 'GatewayError';
  readonly sessionExpired: boolean;
  readonly readOnly: boolean;
  readonly status?: number;

  constructor(message: string, options: GatewayErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.sessionExpired = options.sessionExpired ?? false;
    this.readOnly = options.readOnly ?? false;
    this.status = options.status;
  }

  static from(error: unknown): GatewayError {
    if (error instanceof GatewayError) {
      return error;
    }
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return new GatewayError('Server non raggiungibile: controlla la connessione.', {
          status: 0,
          cause: error,
        });
      }
      if (error.status >= 200 && error.status < 300) {
        return new GatewayError('Risposta non valida dal server.', {
          status: error.status,
          cause: error,
        });
      }
      return new GatewayError(`Errore del server (${error.status}).`, {
        status: error.status,
        cause: error,
      });
    }
    return new GatewayError(errorMessage(error), { cause: error });
  }
}

/** Messaggio leggibile di un errore qualsiasi, per i toast. */
export function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'string' && error) {
    return error;
  }
  return 'Errore generico';
}
