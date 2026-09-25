import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { GatewayClient } from '../core/api/gateway.client';
import { PROCESS } from '../core/api/gateway-processes';
import { Alimento } from '../shared/models/alimento';
import { toNumberOrNull, toText } from './mappers';

/** Dizionario degli ingredienti con i valori nutrizionali (tabella Ali_*). */
export abstract class DizionarioRepository {
  abstract alimenti(): Observable<Alimento[]>;
}

@Injectable()
export class GatewayDizionarioRepository extends DizionarioRepository {
  private readonly gateway = inject(GatewayClient);

  alimenti(): Observable<Alimento[]> {
    return this.gateway.rows(PROCESS.DIZIONARIO_ALIMENTI).pipe(
      map((rows) =>
        rows.map((row) => ({
          descrizione: toText(row['Ali_desc']),
          kcal: toNumberOrNull(row['Ali_kcal']),
          edibile: toNumberOrNull(row['Ali_edi']),
          proteine: toNumberOrNull(row['Ali_prot']),
          proteineAnimali: toNumberOrNull(row['Ali_anim']),
          proteineVegetali: toNumberOrNull(row['Ali_veg']),
          glucidi: toNumberOrNull(row['Ali_glu']),
          amidi: toNumberOrNull(row['Ali_amid']),
          lipidi: toNumberOrNull(row['Ali_lup']),
        })),
      ),
    );
  }
}
