import type { ProcessName } from '../../src/app/core/api/gateway-processes';

/** Dati sintetici con la forma delle risposte reali del gateway (mai dati o token di produzione). */
export const DEFAULT_RESPONSES: Partial<Record<ProcessName, (params: string | number) => unknown>> =
  {
    NOTE_GET: () => ({ recordset: [{ note: 'Ordinare la farina entro venerdì.' }] }),
  };
