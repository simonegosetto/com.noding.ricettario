import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../environments/environment';
import { PROCESS } from '../core/api/gateway-processes';
import { SessionStore } from '../core/auth/session.store';
import { Menu, TipoMenu } from '../shared/models/menu';

/** Varianti di stampa del menù evento. */
export type VarianteStampaMenu = 'standard' | 'foodcost' | 'bom';

/**
 * Stampe generate dai report PHP e aperte in una nuova finestra. Parametri e token in query
 * string sono quelli della versione legacy (il token andrà in un header con il backend NestJS).
 */
@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly session = inject(SessionStore);
  private readonly window = inject(DOCUMENT).defaultView;

  /** Stampa dall'elenco ricette: HTML per le ricette composte, XML per le altre. */
  ricetta(codP: number, composta: boolean): string {
    return composta
      ? this.url(environment.apiReportRicetta, this.ricettaParams(codP, 'ricetta.html'))
      : this.url(environment.apiDBox, this.ricettaParams(codP, 'ricetta.xml'));
  }

  /**
   * Stampa dal dettaglio ricetta. Come nella versione legacy il food cost e il listino
   * si applicano solo alle ricette con sotto-ricette (report HTML).
   */
  ricettaDettaglio(
    codP: number,
    composta: boolean,
    conFoodcost: boolean,
    listinoId: number | null,
  ): string {
    if (!composta) {
      return this.ricetta(codP, false);
    }
    return this.url(environment.apiReportRicetta, {
      ...this.ricettaParams(codP, 'ricetta.html'),
      foodcost: conFoodcost ? '1' : '0',
      listino: String(listinoId ?? ''),
    });
  }

  schedaTecnica(
    codPs: number[],
    descrizione: string,
    conFoodcost: boolean,
    listinoId: number | null,
  ): string {
    return this.url(environment.apiReportSchedaTecnica, {
      gest: '3',
      type: '1',
      process: PROCESS.RICETTA_GET.id,
      params: codPs.join(','),
      token: this.token(),
      report: 'schedatecnica.html',
      foodcost: conFoodcost ? '1' : '0',
      listino: String(listinoId ?? ''),
      descrizione,
    });
  }

  listino(listinoId: number, categoriaId: number): string {
    return this.url(environment.apiReportListino, {
      params: String(listinoId),
      categoria: String(categoriaId),
      token: this.token(),
    });
  }

  menu(menu: Menu, listinoId: number | null, variante: VarianteStampaMenu = 'standard'): string {
    const base =
      menu.tipo === TipoMenu.AllaCarta
        ? environment.apiReportMenuAllaCarta
        : environment.apiReportMenuEvento;
    return this.url(base, {
      menu: String(menu.id),
      listino: String(listinoId ?? ''),
      ...(variante === 'foodcost' ? { foodcost: '1' } : {}),
      ...(variante === 'bom' ? { bom: '1' } : {}),
      descrizione: menu.descrizione,
      token: this.token(),
    });
  }

  /** Apre la stampa in una nuova scheda: va chiamato direttamente dal click per evitare il blocco popup. */
  open(url: string): void {
    this.window?.open(url, '_blank');
  }

  private ricettaParams(codP: number, report: string): Record<string, string> {
    return {
      gest: '3',
      type: '1',
      process: PROCESS.RICETTA_GET.id,
      params: String(codP),
      token: this.token(),
      report,
    };
  }

  private token(): string {
    return this.session.token() ?? '';
  }

  private url(base: string, params: Record<string, string>): string {
    return `${base}?${new URLSearchParams(params).toString()}`;
  }
}
