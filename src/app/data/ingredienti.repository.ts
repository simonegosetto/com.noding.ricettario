import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { GatewayClient } from '../core/api/gateway.client';
import { sql } from '../core/api/gateway-params';
import { PROCESS } from '../core/api/gateway-processes';
import { Categoria } from '../shared/models/categoria';
import { Ingrediente } from '../shared/models/ingrediente';
import { GatewayRow, toNumber, toText } from './mappers';

/** Anagrafica ingredienti e relative categorie. */
export abstract class IngredientiRepository {
  /** Tutti gli ingredienti (la ricerca nella ricetta filtra lato client). */
  abstract all(): Observable<Ingrediente[]>;
  abstract search(testo: string): Observable<Ingrediente[]>;
  abstract categorie(): Observable<Categoria[]>;
}

@Injectable()
export class GatewayIngredientiRepository extends IngredientiRepository {
  private readonly gateway = inject(GatewayClient);

  all(): Observable<Ingrediente[]> {
    return this.gateway.rows(PROCESS.INGREDIENTI_LIST).pipe(map(toDescritti));
  }

  search(testo: string): Observable<Ingrediente[]> {
    return this.gateway.rows(PROCESS.INGREDIENTI_SEARCH, sql.str(testo)).pipe(map(toDescritti));
  }

  categorie(): Observable<Categoria[]> {
    return this.gateway.rows(PROCESS.CATEGORIE_INGREDIENTI_LIST).pipe(map(toDescritti));
  }
}

/** Righe con `id` e `descrizione` (ingredienti, categorie). */
export function toDescritti(rows: GatewayRow[]): { id: number; descrizione: string }[] {
  return rows.map((row) => ({ id: toNumber(row['id']), descrizione: toText(row['descrizione']) }));
}
