import { PROCESS_DEFINITIONS } from './gateway-process-definitions';

export type ProcessKind = 'read' | 'write';

/** Voce del catalogo in gateway-process-definitions.ts. */
export interface ProcessDefinition {
  /** Area funzionale, usata per raggruppare la documentazione. */
  readonly section: string;
  readonly kind: ProcessKind;
  /** Id cifrato del process, inviato così com'è al gateway. */
  readonly id: string;
  /** Parametri posizionali attesi, nell'ordine. */
  readonly params: string;
  /** Contenuto utile della risposta. */
  readonly returns: string;
}

export interface GatewayProcess extends ProcessDefinition {
  /** Nome parlante del process (chiave del catalogo). */
  readonly name: ProcessName;
}

export type ProcessName = keyof typeof PROCESS_DEFINITIONS;

/** Catalogo dei process indicizzato per nome: `gateway.rows(PROCESS.RICETTE_LIST, ...)`. */
export const PROCESS = Object.fromEntries(
  Object.entries(PROCESS_DEFINITIONS).map(([name, definition]) => [name, { name, ...definition }]),
) as Readonly<Record<ProcessName, GatewayProcess>>;
