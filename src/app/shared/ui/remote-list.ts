import { DestroyRef, inject, signal } from '@angular/core';
import { finalize, Observable, Subscription } from 'rxjs';

import { ToastService } from '../../core/ui/toast.service';

export type RemoteListState = 'loading' | 'ready' | 'error';

/**
 * Elenco caricato dal backend in un signal. Ogni `load()` annulla la richiesta precedente
 * (niente risposte fuori ordine), gli errori finiscono in un toast e il refresher viene
 * sempre completato. Va creato in un contesto di injection (campo del componente).
 */
export class RemoteList<T> {
  readonly items = signal<readonly T[]>([]);
  readonly state = signal<RemoteListState>('loading');

  private readonly toast = inject(ToastService);
  private subscription?: Subscription;

  constructor(private readonly source: () => Observable<readonly T[]>) {
    inject(DestroyRef).onDestroy(() => this.subscription?.unsubscribe());
  }

  /** `event`: evento ionRefresh da completare, se il caricamento parte dal pull-to-refresh. */
  load(event?: Event): void {
    this.subscription?.unsubscribe();
    if (this.state() === 'error') {
      this.state.set('loading');
    }
    this.subscription = this.source()
      .pipe(finalize(() => completeIonTarget(event)))
      .subscribe({
        next: (items) => {
          this.items.set(items);
          this.state.set('ready');
        },
        error: (error: unknown) => {
          this.toast.error(error);
          if (this.state() !== 'ready') {
            this.state.set('error');
          }
        },
      });
  }
}

/** Completa il refresher o l'infinite scroll che ha emesso l'evento. */
export function completeIonTarget(event?: Event): void {
  const refresher = event?.target as { complete?: () => Promise<void> } | null | undefined;
  void refresher?.complete?.();
}
