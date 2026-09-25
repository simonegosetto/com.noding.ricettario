import { computed, Injectable, signal } from '@angular/core';
import { defer, finalize, MonoTypeOperatorFunction } from 'rxjs';

/**
 * Chiamate al backend in corso. Sostituisce l'overlay di loading bloccante della versione
 * legacy: la shell mostra una ion-progress-bar e le pagine disabilitano i pulsanti di scrittura.
 */
@Injectable({ providedIn: 'root' })
export class BusyService {
  private readonly pending = signal(0);

  readonly busy = computed(() => this.pending() > 0);

  /** Operatore RxJS: conta la chiamata finché l'Observable è attivo. */
  track<T>(): MonoTypeOperatorFunction<T> {
    return (source) =>
      defer(() => {
        this.pending.update((count) => count + 1);
        return source.pipe(finalize(() => this.pending.update((count) => count - 1)));
      });
  }
}
