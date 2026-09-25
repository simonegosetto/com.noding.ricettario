import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, switchMap, throwError } from 'rxjs';

import { GatewayClient } from '../core/api/gateway.client';
import { sql, sqlParams } from '../core/api/gateway-params';
import { PROCESS } from '../core/api/gateway-processes';
import {
  ArchivioCartella,
  ArchivioContenuto,
  ArchivioElemento,
  ArchivioNuovoFile,
} from '../shared/models/archivio-file';
import { readFileAsBase64, toDataUrl } from './file-reader';
import { FileStorageRepository, StorageFolder } from './file-storage.repository';
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
  /**
   * Carica un file nella cartella: registra i metadati (l'arc_codi restituito diventa il nome
   * su Dropbox) e poi invia il contenuto. Se l'invio fallisce il record viene rimosso.
   */
  abstract uploadFile(folderId: number, file: File): Observable<void>;
  abstract moveFile(arcCodi: number, folderId: number): Observable<void>;
  /** Elimina il file dal DB e poi da Dropbox. */
  abstract deleteFile(file: ArchivioElemento): Observable<void>;
  /** Link temporaneo per scaricare il file. */
  abstract fileLink(file: ArchivioElemento): Observable<string>;
}

@Injectable()
export class GatewayArchivioRepository extends ArchivioRepository {
  private readonly gateway = inject(GatewayClient);
  private readonly storage = inject(FileStorageRepository);

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
          folderId,
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

  uploadFile(folderId: number, file: File): Observable<void> {
    const meta: ArchivioNuovoFile = {
      nome: file.name,
      folderid: folderId,
      size: file.size,
      type: file.type,
    };
    return readFileAsBase64(file).pipe(
      switchMap((base64) =>
        this.insertFile(meta).pipe(
          switchMap((arcCodi) =>
            this.storage
              .upload({
                folder: StorageFolder.Documenti,
                id: arcCodi,
                name: file.name,
                type: file.type,
                data: toDataUrl(file.type, base64),
              })
              .pipe(
                // Senza il contenuto su Dropbox il record resterebbe orfano: lo si rimuove.
                catchError((error: unknown) =>
                  this.gateway
                    .exec(PROCESS.ARCHIVIO_FILE_DELETE, arcCodi)
                    .pipe(switchMap(() => throwError(() => error))),
                ),
              ),
          ),
        ),
      ),
    );
  }

  private insertFile(file: ArchivioNuovoFile): Observable<number> {
    const params = sqlParams(
      sql.str(file.nome),
      sql.str(file.nome),
      sql.num(file.folderid),
      sql.num(file.size),
      sql.str(file.type),
      sql.out('out_id'),
    );
    return this.gateway.output(PROCESS.ARCHIVIO_FILE_INSERT, params).pipe(
      map((output) => {
        const arcCodi = toNumber(output?.['out_id']);
        if (!(arcCodi > 0)) {
          // Senza id il file finirebbe su Dropbox con un nome che nessun record indica.
          throw new Error('Il server non ha restituito l’id del file.');
        }
        return arcCodi;
      }),
    );
  }

  moveFile(arcCodi: number, folderId: number): Observable<void> {
    const params = sqlParams(sql.num(arcCodi), sql.num(folderId));
    return this.gateway.exec(PROCESS.ARCHIVIO_FILE_MOVE, params);
  }

  deleteFile(file: ArchivioElemento): Observable<void> {
    const deleted = this.gateway.exec(PROCESS.ARCHIVIO_FILE_DELETE, file.arc_codi);
    const storagePath = file.id_storage;
    return storagePath ? deleted.pipe(switchMap(() => this.storage.delete(storagePath))) : deleted;
  }

  fileLink(file: ArchivioElemento): Observable<string> {
    if (!file.id_storage) {
      return throwError(() => new Error('Il file non è disponibile su Dropbox.'));
    }
    return this.storage.link(file.id_storage);
  }
}
