import { HttpContextToken } from '@angular/common/http';

import { ProcessKind } from './gateway-processes';

/** Operazione verso il backend PHP associata a una richiesta HTTP. */
export interface GatewayOperation {
  /** Nome del process o dell'azione (es. RICETTA_SAVE, DROPBOX_UPLOAD). */
  readonly name: string;
  readonly kind: ProcessKind;
}

/** Impostato da GatewayClient su ogni richiesta; letto dal readOnlyInterceptor. */
export const GATEWAY_OPERATION = new HttpContextToken<GatewayOperation | null>(() => null);
