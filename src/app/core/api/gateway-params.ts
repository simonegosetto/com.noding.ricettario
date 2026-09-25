/**
 * Formattazione dei parametri posizionali del gateway.
 *
 * FD_DataServiceGatewayCrypt.php compone la chiamata alla stored procedure concatenando la
 * stringa `params` (es. `CALL sp(12,'Pasta',@out_id)`), quindi ogni valore va passato come
 * letterale SQL MySQL già formattato. Gli apici e i backslash nelle stringhe vengono
 * raddoppiati: prima un apostrofo nel nome di una ricetta faceva fallire la chiamata.
 *
 * Nota: è una correzione lato client, non una protezione dalla SQL injection. Quella va fatta
 * nel backend (prepared statement), vedi docs/gateway-processes.md.
 */
export const sql = {
  /** Stringa tra apici; `null`/`undefined` diventano stringa vuota. */
  str(value: string | number | null | undefined): string {
    const text = value === null || value === undefined ? '' : String(value);
    return `'${text.replace(/\\/g, '\\\\').replace(/'/g, "''").replace(/\0/g, '')}'`;
  },

  /** Numero; valori mancanti o non numerici diventano `NULL`. Accetta le stringhe delle select. */
  num(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return 'NULL';
    }
    const n = typeof value === 'number' ? value : Number(value.trim().replace(',', '.'));
    return Number.isFinite(n) ? String(n) : 'NULL';
  },

  /** Flag come 1/0. */
  bool(value: boolean | null | undefined): string {
    return value ? '1' : '0';
  },

  /** Parametro OUT della stored procedure (es. `@out_id`), letto poi da `output[0]`. */
  out(name: string): string {
    if (!/^\w+$/.test(name)) {
      throw new Error(`Nome di parametro OUT non valido: ${name}`);
    }
    return `@${name}`;
  },
};

/** Unisce i valori già formattati con `sql.*` nella stringa posizionale attesa dal gateway. */
export function sqlParams(...values: string[]): string {
  return values.join(',');
}
