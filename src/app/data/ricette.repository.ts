import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { GatewayClient } from '../core/api/gateway.client';
import { sql, sqlParams } from '../core/api/gateway-params';
import { PROCESS } from '../core/api/gateway-processes';
import { FoodcostTotali, IngredienteFoodcost } from '../shared/models/ingrediente-foodcost';
import {
  NuovaRicettaRiga,
  Ricetta,
  RicettaCercata,
  RicettaListItem,
  RicettaRiga,
  RicettaSalvataggio,
  TipoRicetta,
} from '../shared/models/ricetta';
import { GatewayRow, toBoolean, toNumber, toNumberOrNull, toText, toTextOrNull } from './mappers';

export abstract class RicetteRepository {
  abstract list(tipo: TipoRicetta): Observable<RicettaListItem[]>;
  abstract search(testo: string): Observable<RicettaCercata[]>;
  abstract searchSchedeTecniche(testo: string): Observable<RicettaCercata[]>;
  abstract get(codP: number): Observable<Ricetta | undefined>;
  /** Salva la testata e restituisce il cod_p (nuovo, se la ricetta era da creare). */
  abstract save(ricetta: RicettaSalvataggio): Observable<number>;
  abstract delete(codP: number): Observable<void>;
  abstract righe(codP: number): Observable<RicettaRiga[]>;
  abstract addRiga(codP: number, riga: NuovaRicettaRiga): Observable<void>;
  abstract updateRiga(codP: number, riga: RicettaRiga): Observable<void>;
  abstract deleteRiga(codP: number, rigaId: number): Observable<void>;
  /** Sposta una riga; `posizione` parte da 1. */
  abstract moveRiga(codP: number, rigaId: number, posizione: number): Observable<void>;
  /** cod_p delle sotto-ricette usate dalla ricetta. */
  abstract sottoricette(codP: number): Observable<number[]>;
  abstract foodcost(codP: number, listinoId: number): Observable<IngredienteFoodcost[]>;
  abstract foodcostTotali(codP: number, listinoId: number): Observable<FoodcostTotali | undefined>;
}

@Injectable()
export class GatewayRicetteRepository extends RicetteRepository {
  private readonly gateway = inject(GatewayClient);

  list(tipo: TipoRicetta): Observable<RicettaListItem[]> {
    return this.gateway.rows(PROCESS.RICETTE_LIST, sql.num(tipo)).pipe(
      map((rows) =>
        rows.map((row) => ({
          cod_p: toNumber(row['cod_p']),
          nome_ric: toText(row['nome_ric']),
          composta: toBoolean(row['composta']),
        })),
      ),
    );
  }

  search(testo: string): Observable<RicettaCercata[]> {
    return this.gateway.rows(PROCESS.RICETTE_SEARCH, sql.str(testo)).pipe(map(toRicetteCercate));
  }

  searchSchedeTecniche(testo: string): Observable<RicettaCercata[]> {
    return this.gateway
      .rows(PROCESS.SCHEDE_TECNICHE_SEARCH, sql.str(testo))
      .pipe(map(toRicetteCercate));
  }

  get(codP: number): Observable<Ricetta | undefined> {
    return this.gateway.first(PROCESS.RICETTA_GET, sql.num(codP)).pipe(
      map((row) =>
        row
          ? {
              cod_p: toNumber(row['cod_p'], codP),
              nome_ric: toText(row['nome_ric']),
              procedimento: toTextOrNull(row['procedimento']),
              prezzo_vendita: toNumberOrNull(row['prezzo_vendita']),
              peso_effettivo: toNumberOrNull(row['peso_effettivo']),
              id_storage: toTextOrNull(row['id_storage']),
            }
          : undefined,
      ),
    );
  }

  save(ricetta: RicettaSalvataggio): Observable<number> {
    const params = sqlParams(
      sql.num(ricetta.cod_p),
      sql.str(ricetta.nome_ric),
      sql.str(ricetta.procedimento),
      sql.num(ricetta.prezzo_vendita ?? 0),
      sql.num(ricetta.peso_effettivo ?? 0),
      sql.out('out_id'),
    );
    return this.gateway
      .output(PROCESS.RICETTA_SAVE, params)
      .pipe(map((output) => toNumber(output?.['out_id'], ricetta.cod_p)));
  }

  delete(codP: number): Observable<void> {
    return this.gateway.exec(PROCESS.RICETTA_DELETE, sql.num(codP));
  }

  righe(codP: number): Observable<RicettaRiga[]> {
    return this.gateway.rows(PROCESS.RICETTA_RIGHE, sql.num(codP)).pipe(
      map((rows) =>
        rows.map((row) => ({
          id: toNumber(row['id']),
          nome: toText(row['nome']),
          quantita: toNumberOrNull(row['quantita']),
          perc: toNumberOrNull(row['perc']),
          ricettaid: toNumber(row['ricettaid']),
          escludi_peso: toBoolean(row['escludi_peso']),
        })),
      ),
    );
  }

  addRiga(codP: number, riga: NuovaRicettaRiga): Observable<void> {
    const params = sqlParams(
      sql.str(riga.nome),
      sql.num(riga.quantita ?? 0),
      sql.num(riga.ricettaid),
      sql.num(codP),
      sql.num(riga.ingredienteid),
    );
    return this.gateway.exec(PROCESS.RICETTA_RIGA_INSERT, params);
  }

  updateRiga(codP: number, riga: RicettaRiga): Observable<void> {
    const params = sqlParams(
      sql.num(riga.id),
      sql.str(riga.nome),
      sql.num(riga.quantita ?? 0),
      sql.num(riga.ricettaid),
      sql.num(codP),
      sql.bool(riga.escludi_peso),
    );
    return this.gateway.exec(PROCESS.RICETTA_RIGA_UPDATE, params);
  }

  deleteRiga(codP: number, rigaId: number): Observable<void> {
    return this.gateway.exec(
      PROCESS.RICETTA_RIGA_DELETE,
      sqlParams(sql.num(rigaId), sql.num(codP)),
    );
  }

  moveRiga(codP: number, rigaId: number, posizione: number): Observable<void> {
    const params = sqlParams(sql.num(rigaId), sql.num(posizione), sql.num(codP));
    return this.gateway.exec(PROCESS.RICETTA_RIGA_MOVE, params);
  }

  sottoricette(codP: number): Observable<number[]> {
    return this.gateway
      .rows(PROCESS.RICETTA_SOTTORICETTE, sql.num(codP))
      .pipe(map((rows) => rows.map((row) => toNumber(row['ricettaid']))));
  }

  foodcost(codP: number, listinoId: number): Observable<IngredienteFoodcost[]> {
    return this.gateway
      .rows(PROCESS.RICETTA_FOODCOST_RIGHE, sqlParams(sql.num(codP), sql.num(listinoId)))
      .pipe(
        map((rows) =>
          rows.map((row) => ({
            descrizione: toText(row['descrizione']),
            peso: toNumber(row['peso']),
            kcal: toNumber(row['kcal']),
            foodcost: toNumber(row['foodcost']),
          })),
        ),
      );
  }

  foodcostTotali(codP: number, listinoId: number): Observable<FoodcostTotali | undefined> {
    return this.gateway
      .first(PROCESS.RICETTA_FOODCOST_TOTALI, sqlParams(sql.num(codP), sql.num(listinoId)))
      .pipe(
        map((row) =>
          row
            ? {
                peso: toNumber(row['peso']),
                foodcost: toNumber(row['foodcost']),
                kcal: toNumber(row['kcal']),
                peso_effettivo: toNumberOrNull(row['peso_effettivo']),
                prezzo_lordo_vendita: toNumberOrNull(row['prezzo_lordo_vendita']),
                ratio: toNumberOrNull(row['ratio']),
                prezzo_netto_vendita: toNumberOrNull(row['prezzo_netto_vendita']),
                margine_netto: toNumberOrNull(row['margine_netto']),
              }
            : undefined,
        ),
      );
  }
}

function toRicetteCercate(rows: GatewayRow[]): RicettaCercata[] {
  return rows.map((row) => ({ cod_p: toNumber(row['cod_p']), nome_ric: toText(row['nome_ric']) }));
}
