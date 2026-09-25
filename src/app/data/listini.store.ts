import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, shareReplay, tap } from 'rxjs';

import { Listino } from '../shared/models/listino';
import { ListiniRepository } from './listini.repository';

/**
 * Elenco dei listini condiviso fra le pagine (titolo del dettaglio, selettori di ricetta,
 * menù e schede) e listino corrente della sessione. Come nella versione legacy il default è
 * l'ultimo listino; una scelta fatta in una pagina resta valida anche nelle altre.
 */
@Injectable({ providedIn: 'root' })
export class ListiniStore {
  private readonly repository = inject(ListiniRepository);

  private readonly _listini = signal<readonly Listino[]>([]);
  private readonly scelto = signal<number | null>(null);
  private request$?: Observable<readonly Listino[]>;

  readonly listini = this._listini.asReadonly();
  readonly correnteId = computed(() => {
    const listini = this._listini();
    const scelto = this.scelto();
    return listini.some((listino) => listino.id === scelto) ? scelto : (listini.at(-1)?.id ?? null);
  });

  /** Carica i listini (una sola richiesta anche se chiamato da più componenti insieme). */
  load(force = false): Observable<readonly Listino[]> {
    if (force || !this.request$) {
      this.request$ = this.repository.list().pipe(
        tap((listini) => this._listini.set(listini)),
        finalize(() => (this.request$ = undefined)),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
    }
    return this.request$;
  }

  seleziona(id: number | null): void {
    this.scelto.set(id);
  }

  byId(id: number): Listino | undefined {
    return this._listini().find((listino) => listino.id === id);
  }
}
