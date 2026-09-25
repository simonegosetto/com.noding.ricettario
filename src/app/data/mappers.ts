import { GatewayRow } from '../core/api/gateway-response';

/**
 * Normalizzazione dei valori restituiti dal PHP: i numeri possono arrivare come stringhe
 * e i flag come 0/1.
 */
export function toNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  return value !== null && value !== '' && Number.isFinite(n) ? n : fallback;
}

export function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function toText(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}

export function toTextOrNull(value: unknown): string | null {
  return value === null || value === undefined || value === '' ? null : String(value);
}

export function toBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true';
}

export type { GatewayRow };
