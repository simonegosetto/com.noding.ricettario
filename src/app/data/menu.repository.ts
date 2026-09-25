import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { GatewayClient } from '../core/api/gateway.client';
import { sql, sqlParams } from '../core/api/gateway-params';
import { PROCESS } from '../core/api/gateway-processes';
import { Categoria } from '../shared/models/categoria';
import {
  Menu,
  MenuSalvataggio,
  MenuTotali,
  RigaMenuAllaCarta,
  RigaMenuEvento,
  TipoMenu,
} from '../shared/models/menu';
import { toDescritti } from './ingredienti.repository';
import { GatewayRow, toNumber, toNumberOrNull, toText } from './mappers';

export abstract class MenuRepository {
  abstract list(): Observable<Menu[]>;
  abstract get(id: number): Observable<Menu | undefined>;
  /** Crea (id 0) o aggiorna nome e tipo del menù. */
  abstract save(menu: MenuSalvataggio): Observable<void>;
  abstract delete(id: number): Observable<void>;
  abstract categorie(): Observable<Categoria[]>;
  abstract righeAllaCarta(menuId: number, listinoId: number): Observable<RigaMenuAllaCarta[]>;
  abstract righeEvento(menuId: number, listinoId: number): Observable<RigaMenuEvento[]>;
  /** Aggiunge un piatto; per i menù evento la categoria è 0. */
  abstract addPiatto(menuId: number, codP: number, categoriaId: number): Observable<void>;
  abstract deleteRiga(id: number): Observable<void>;
  /** Sposta una riga del menù evento; `posizione` parte da 1. */
  abstract moveRiga(menuId: number, rigaId: number, posizione: number): Observable<void>;
  /** Inserisce un separatore sotto la riga indicata. */
  abstract addSeparatore(menuId: number, rigaId: number): Observable<void>;
  abstract deleteSeparatore(id: number): Observable<void>;
  abstract updateCoperti(
    menuId: number,
    pax: number | null,
    percRicetta: number | null,
  ): Observable<void>;
  abstract totali(menuId: number, listinoId: number): Observable<MenuTotali | undefined>;
}

@Injectable()
export class GatewayMenuRepository extends MenuRepository {
  private readonly gateway = inject(GatewayClient);

  list(): Observable<Menu[]> {
    return this.gateway.rows(PROCESS.MENU_LIST).pipe(map((rows) => rows.map(toMenu)));
  }

  get(id: number): Observable<Menu | undefined> {
    return this.gateway
      .first(PROCESS.MENU_GET, sql.num(id))
      .pipe(map((row) => (row ? toMenu(row) : undefined)));
  }

  save(menu: MenuSalvataggio): Observable<void> {
    if (menu.id > 0) {
      const params = sqlParams(sql.num(menu.id), sql.str(menu.descrizione), sql.num(menu.tipo));
      return this.gateway.exec(PROCESS.MENU_UPDATE, params);
    }
    // Nuovo menù: pax e percentuale scheda tecnica partono da 0.
    const params = sqlParams(sql.num(0), sql.str(menu.descrizione), sql.num(menu.tipo), '0', '0');
    return this.gateway.exec(PROCESS.MENU_INSERT, params);
  }

  delete(id: number): Observable<void> {
    return this.gateway.exec(PROCESS.MENU_DELETE, sql.num(id));
  }

  categorie(): Observable<Categoria[]> {
    return this.gateway.rows(PROCESS.MENU_CATEGORIE_LIST).pipe(map(toDescritti));
  }

  righeAllaCarta(menuId: number, listinoId: number): Observable<RigaMenuAllaCarta[]> {
    return this.gateway
      .rows(PROCESS.MENU_ALLA_CARTA_RIGHE, sqlParams(sql.num(menuId), sql.num(listinoId)))
      .pipe(
        map((rows) =>
          rows.map((row): RigaMenuAllaCarta =>
            toNumber(row['tipo']) === 1
              ? { kind: 'categoria', id: toNumber(row['id']), categoria: toText(row['categoria']) }
              : {
                  kind: 'piatto',
                  id: toNumber(row['id']),
                  ricettaid: toNumber(row['ricettaid']),
                  descrizione: toText(row['descrizione']),
                  foodcost: toNumberOrNull(row['foodcost']),
                  prezzo_lordo_vendita: toNumberOrNull(row['prezzo_lordo_vendita']),
                },
          ),
        ),
      );
  }

  righeEvento(menuId: number, listinoId: number): Observable<RigaMenuEvento[]> {
    return this.gateway
      .rows(PROCESS.MENU_EVENTO_RIGHE, sqlParams(sql.num(menuId), sql.num(listinoId)))
      .pipe(
        map((rows) =>
          rows.map((row): RigaMenuEvento =>
            toNumber(row['tipo']) === 2
              ? { kind: 'separatore', id: toNumber(row['id']) }
              : {
                  kind: 'piatto',
                  id: toNumber(row['id']),
                  ricettaid: toNumber(row['ricettaid']),
                  descrizione: toText(row['descrizione']),
                },
          ),
        ),
      );
  }

  addPiatto(menuId: number, codP: number, categoriaId: number): Observable<void> {
    const params = sqlParams(sql.num(menuId), sql.num(codP), sql.num(categoriaId));
    return this.gateway.exec(PROCESS.MENU_RIGA_INSERT, params);
  }

  deleteRiga(id: number): Observable<void> {
    return this.gateway.exec(PROCESS.MENU_RIGA_DELETE, sql.num(id));
  }

  moveRiga(menuId: number, rigaId: number, posizione: number): Observable<void> {
    const params = sqlParams(sql.num(rigaId), sql.num(posizione), sql.num(menuId));
    return this.gateway.exec(PROCESS.MENU_RIGA_MOVE, params);
  }

  addSeparatore(menuId: number, rigaId: number): Observable<void> {
    const params = sqlParams(sql.num(rigaId), sql.num(menuId));
    return this.gateway.exec(PROCESS.MENU_SEPARATORE_INSERT, params);
  }

  deleteSeparatore(id: number): Observable<void> {
    return this.gateway.exec(PROCESS.MENU_SEPARATORE_DELETE, sql.num(id));
  }

  updateCoperti(menuId: number, pax: number | null, percRicetta: number | null): Observable<void> {
    const params = sqlParams(sql.num(menuId), sql.num(pax), sql.num(percRicetta));
    return this.gateway.exec(PROCESS.MENU_COPERTI_UPDATE, params);
  }

  totali(menuId: number, listinoId: number): Observable<MenuTotali | undefined> {
    return this.gateway
      .first(PROCESS.MENU_TOTALI, sqlParams(sql.num(menuId), sql.num(listinoId)))
      .pipe(
        map((row) =>
          row
            ? {
                foodcost: toNumberOrNull(row['foodcost']),
                netto: toNumberOrNull(row['netto']),
                iva: toNumberOrNull(row['iva']),
                lordo: toNumberOrNull(row['lordo']),
                foodcost_tot: toNumberOrNull(row['foodcost_tot']),
                netto_tot: toNumberOrNull(row['netto_tot']),
                lordo_tot: toNumberOrNull(row['lordo_tot']),
              }
            : undefined,
        ),
      );
  }
}

function toMenu(row: GatewayRow): Menu {
  return {
    id: toNumber(row['id']),
    descrizione: toText(row['descrizione']),
    tipo: toNumber(row['tipo']) === TipoMenu.Evento ? TipoMenu.Evento : TipoMenu.AllaCarta,
    pax: toNumberOrNull(row['pax']),
    perc_ricetta: toNumberOrNull(row['perc_ricetta']),
  };
}
