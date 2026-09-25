import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { GatewayClient } from '../core/api/gateway.client';
import { sql, sqlParams } from '../core/api/gateway-params';
import { PROCESS } from '../core/api/gateway-processes';
import { SchedaProduzione, SchedaProduzioneRiga } from '../shared/models/schede-produzione';
import { toDescritti } from './ingredienti.repository';
import { toNumber } from './mappers';

export abstract class SchedeProduzioneRepository {
  abstract list(): Observable<SchedaProduzione[]>;
  /** Crea (id 0) o rinomina una scheda. */
  abstract save(scheda: SchedaProduzione): Observable<void>;
  abstract delete(id: number): Observable<void>;
  abstract righe(schedaId: number): Observable<SchedaProduzioneRiga[]>;
  abstract addRicetta(schedaId: number, codP: number): Observable<void>;
  abstract deleteRiga(id: number): Observable<void>;
}

@Injectable()
export class GatewaySchedeProduzioneRepository extends SchedeProduzioneRepository {
  private readonly gateway = inject(GatewayClient);

  list(): Observable<SchedaProduzione[]> {
    return this.gateway.rows(PROCESS.SCHEDE_LIST).pipe(map(toDescritti));
  }

  save(scheda: SchedaProduzione): Observable<void> {
    const params = sqlParams(sql.num(scheda.id), sql.str(scheda.descrizione));
    return this.gateway.exec(PROCESS.SCHEDA_SAVE, params);
  }

  delete(id: number): Observable<void> {
    return this.gateway.exec(PROCESS.SCHEDA_DELETE, id);
  }

  righe(schedaId: number): Observable<SchedaProduzioneRiga[]> {
    return this.gateway
      .rows(PROCESS.SCHEDA_RIGHE, sql.num(schedaId))
      .pipe(
        map((rows) =>
          rows.map((row) => ({ id: toNumber(row['id']), ricettaid: toNumber(row['ricettaid']) })),
        ),
      );
  }

  addRicetta(schedaId: number, codP: number): Observable<void> {
    const params = sqlParams(sql.num(schedaId), sql.num(codP));
    return this.gateway.exec(PROCESS.SCHEDA_RIGA_INSERT, params);
  }

  deleteRiga(id: number): Observable<void> {
    return this.gateway.exec(PROCESS.SCHEDA_RIGA_DELETE, id);
  }
}
