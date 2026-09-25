/** Riga generica restituita dal gateway: i tipi vengono normalizzati nei repository. */
export type GatewayRow = Record<string, unknown>;

/**
 * Risposta di FD_DataServiceGatewayCrypt.php.
 * In caso di errore la chiave `error` è presente (anche vuota): è il criterio usato dalla versione legacy.
 */
export interface GatewayResponse<R = GatewayRow, O = GatewayRow> {
  recordset?: R[];
  /** Valori dei parametri OUT della stored procedure (es. `output[0].out_id`). */
  output?: O[];
  error?: string;
}

/** Risposta di FD_Login.php. */
export interface LoginResponse {
  user?: GatewayRow[];
  token?: { token?: string };
  error?: string;
}
