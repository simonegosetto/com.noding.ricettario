import { Observable } from 'rxjs';

/** Configurazione del modale di ricerca generico. */
export interface SearchSource<T> {
  /**
   * `server`: una chiamata al backend per ogni testo (dopo `minChars` caratteri).
   * `client`: elenco completo caricato all'apertura e filtrato localmente.
   */
  readonly mode: 'server' | 'client';
  /** Caratteri minimi prima di cercare o mostrare risultati (0 = elenco subito visibile). */
  readonly minChars: number;
  readonly load: (text: string) => Observable<readonly T[]>;
  readonly label: (item: T) => string;
  readonly key: (item: T) => string | number;
}
