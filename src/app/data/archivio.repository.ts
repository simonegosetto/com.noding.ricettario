import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { GatewayClient } from '../core/api/gateway.client';
import { sql, sqlParams } from '../core/api/gateway-params';
import { PROCESS } from '../core/api/gateway-processes';
import {
  ArchivioCartella,
  ArchivioContenuto,
  ArchivioNuovoFile,
} from '../shared/models/archivio-file';
import { toDescritti } from './ingredienti.repository';
import { toNumber, toText, toTextOrNull } from './mappers';

/** Archivio documenti a cartelle; i file stanno su Dropbox (FileStorageRepository). */
export abstract class ArchivioRepository {
  abstract contenuto(folderId: number): Observable<ArchivioContenuto>;
  abstract cartelle(): Observable<ArchivioCartella[]>;
  abstract createFolder(descrizione: string, parentId: number): Observable<void>;
  abstract renameFolder(folderId: number, descrizione: string): Observable<void>;
  /** Elimina la cartella e tutto il suo contenuto. */
  abstract deleteFolder(folderId: number): Observable<void>;
  /** Registra il file e restituisce il suo arc_codi, usato come nome su Dropbox. */
  abstract insertFile(file: ArchivioNuovoFile): Observable<number>;
  abstract moveFile(arcCodi: number, folderId: number): Observable<void>;
  abstract deleteFile(arcCodi: number): Observable<void>;
}

@Injectable()
export class GatewayArchivioRepository extends ArchivioRepository {
  private readonly gateway = inject(GatewayClient);

  contenuto(folderId: number): Observable<ArchivioContenuto> {
    const params = sqlParams(
      sql.num(folderId),
      sql.out('foldername'),
      sql.out('parentid'),
      sql.out('parentname'),
    );
    return this.gateway.call(PROCESS.ARCHIVIO_LIST, params).pipe(
      map((response) => {
        const output = response.output?.[0] ?? {};
        return {
          elementi: (response.recordset ?? []).map((row) => {
            const icon = toText(row['icon']) || 'document';
            return {
              isCartella: icon === 'folder',
              folderid: toNumber(row['folderid']),
              arc_codi: toNumber(row['arc_codi']),
              descrizione: toText(row['descrizione']),
              icon,
              numero_file: toNumber(row['numero_file']),
              numero_cartelle: toNumber(row['numero_cartelle']),
              id_storage: toTextOrNull(row['id_storage']),
            };
          }),
          folderName: toTextOrNull(output['foldername']),
          parentId: toNumber(output['parentid']),
          parentName: toTextOrNull(output['parentname']),
        };
      }),
    );
  }

  cartelle(): Observable<ArchivioCartella[]> {
    return this.gateway.rows(PROCESS.ARCHIVIO_CARTELLE_TREE).pipe(map(toDescritti));
  }

  createFolder(descrizione: string, parentId: number): Observable<void> {
    const params = sqlParams(sql.str(descrizione), sql.num(parentId));
    return this.gateway.exec(PROCESS.ARCHIVIO_CARTELLA_INSERT, params);
  }

  renameFolder(folderId: number, descrizione: string): Observable<void> {
    const params = sqlParams(sql.num(folderId), sql.str(descrizione));
    return this.gateway.exec(PROCESS.ARCHIVIO_CARTELLA_RENAME, params);
  }

  deleteFolder(folderId: number): Observable<void> {
    return this.gateway.exec(PROCESS.ARCHIVIO_CARTELLA_DELETE, sql.num(folderId));
  }

  insertFile(file: ArchivioNuovoFile): Observable<number> {
    const params = sqlParams(
      sql.str(file.nome),
      sql.str(file.nome),
      sql.num(file.folderid),
      sql.num(file.size),
      sql.str(file.type),
      sql.out('out_id'),
    );
    return this.gateway
      .output(PROCESS.ARCHIVIO_FILE_INSERT, params)
      .pipe(map((output) => toNumber(output?.['out_id'])));
  }

  moveFile(arcCodi: number, folderId: number): Observable<void> {
    const params = sqlParams(sql.num(arcCodi), sql.num(folderId));
    return this.gateway.exec(PROCESS.ARCHIVIO_FILE_MOVE, params);
  }

  deleteFile(arcCodi: number): Observable<void> {
    return this.gateway.exec(PROCESS.ARCHIVIO_FILE_DELETE, sql.num(arcCodi));
  }
}
