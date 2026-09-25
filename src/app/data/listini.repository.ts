import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { GatewayClient } from '../core/api/gateway.client';
import { sql, sqlParams } from '../core/api/gateway-params';
import { PROCESS } from '../core/api/gateway-processes';
import { Listino, ListinoRiga, ListinoRigaModifica } from '../shared/models/listino';
import { toNumber, toNumberOrNull, toText, toTextOrNull } from './mappers';

/** Separatore con cui la vista view_ingrediente_ricette concatena i nomi delle ricette. */
const RICETTE_SEPARATOR = /<p><\/p>/i;

export abstract class ListiniRepository {
  abstract list(): Observable<Listino[]>;
  /** Crea (id 0) o aggiorna un listino. */
  abstract save(listino: Listino): Observable<void>;
  abstract delete(id: number): Observable<void>;
  abstract righe(listinoId: number, categoriaId: number): Observable<ListinoRiga[]>;
  abstract updateRiga(riga: ListinoRigaModifica): Observable<void>;
  abstract deleteRiga(id: number): Observable<void>;
  abstract addIngrediente(listinoId: number, ingredienteId: number): Observable<void>;
  abstract addSchedaTecnica(listinoId: number, codP: number): Observable<void>;
  abstract addMenu(listinoId: number, menuId: number): Observable<void>;
}

@Injectable()
export class GatewayListiniRepository extends ListiniRepository {
  private readonly gateway = inject(GatewayClient);

  list(): Observable<Listino[]> {
    return this.gateway.rows(PROCESS.LISTINI_LIST).pipe(
      map((rows) =>
        rows.map((row) => ({
          id: toNumber(row['id']),
          descrizione: toText(row['descrizione']),
          aliquota: toNumber(row['aliquota']),
        })),
      ),
    );
  }

  save(listino: Listino): Observable<void> {
    const params = sqlParams(
      sql.num(listino.id),
      sql.str(listino.descrizione),
      sql.num(listino.aliquota),
    );
    return this.gateway.exec(PROCESS.LISTINO_SAVE, params);
  }

  delete(id: number): Observable<void> {
    return this.gateway.exec(PROCESS.LISTINO_DELETE, sql.num(id));
  }

  righe(listinoId: number, categoriaId: number): Observable<ListinoRiga[]> {
    return this.gateway
      .rows(PROCESS.LISTINO_RIGHE, sqlParams(sql.num(listinoId), sql.num(categoriaId)))
      .pipe(
        map((rows) =>
          rows.map((row) => ({
            id: toNumber(row['id']),
            listinoid: toNumber(row['listinoid'], listinoId),
            ingredienteid: toNumber(row['ingredienteid']),
            descrizione: toText(row['descrizione']),
            scarto: toNumberOrNull(row['scarto']),
            grammatura: toNumberOrNull(row['grammatura']),
            prezzo: toNumberOrNull(row['prezzo']),
            categoriaid: toNumberOrNull(row['categoriaid']),
            categorianome: toTextOrNull(row['categorianome']),
            kcal: toNumberOrNull(row['kcal']),
            provenienza: toTextOrNull(row['provenienza']),
            ricette: toText(row['ricette'])
              .split(RICETTE_SEPARATOR)
              .map((nome) => nome.trim())
              .filter((nome) => nome !== ''),
          })),
        ),
      );
  }

  updateRiga(riga: ListinoRigaModifica): Observable<void> {
    const params = sqlParams(
      sql.num(riga.id),
      sql.num(riga.scarto),
      sql.num(riga.grammatura),
      sql.num(riga.prezzo),
      sql.num(riga.categoriaid),
      sql.num(riga.kcal),
      sql.str(riga.descrizione),
      sql.str(riga.provenienza),
    );
    return this.gateway.exec(PROCESS.LISTINO_RIGA_UPDATE, params);
  }

  deleteRiga(id: number): Observable<void> {
    return this.gateway.exec(PROCESS.LISTINO_RIGA_DELETE, sql.num(id));
  }

  addIngrediente(listinoId: number, ingredienteId: number): Observable<void> {
    const params = sqlParams(sql.num(listinoId), sql.num(ingredienteId));
    return this.gateway.exec(PROCESS.LISTINO_ADD_INGREDIENTE, params);
  }

  addSchedaTecnica(listinoId: number, codP: number): Observable<void> {
    const params = sqlParams(sql.num(listinoId), sql.num(codP));
    return this.gateway.exec(PROCESS.LISTINO_ADD_SCHEDA_TECNICA, params);
  }

  addMenu(listinoId: number, menuId: number): Observable<void> {
    // La stored procedure vuole prima il menù e poi il listino.
    const params = sqlParams(sql.num(menuId), sql.num(listinoId));
    return this.gateway.exec(PROCESS.LISTINO_ADD_MENU, params);
  }
}
