import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { GatewayClient } from '../core/api/gateway.client';
import { sql } from '../core/api/gateway-params';
import { PROCESS } from '../core/api/gateway-processes';
import { toText } from './mappers';

/** Blocco note condiviso della home. */
export abstract class NoteRepository {
  abstract get(): Observable<string>;
  abstract save(testo: string): Observable<void>;
}

@Injectable()
export class GatewayNoteRepository extends NoteRepository {
  private readonly gateway = inject(GatewayClient);

  get(): Observable<string> {
    return this.gateway.first(PROCESS.NOTE_GET).pipe(map((row) => toText(row?.['note'])));
  }

  save(testo: string): Observable<void> {
    return this.gateway.exec(PROCESS.NOTE_UPDATE, sql.str(testo));
  }
}
