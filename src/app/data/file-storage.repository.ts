import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { GatewayClient } from '../core/api/gateway.client';
import { toText } from './mappers';

/** Cartelle Dropbox usate dal backend. */
export const StorageFolder = {
  Documenti: 'documenti/',
  Ricette: 'ricette/',
} as const;
export type StorageFolder = (typeof StorageFolder)[keyof typeof StorageFolder];

/** File da caricare: `data` è un data URL base64 (`data:<type>;base64,...`). */
export interface StorageUpload {
  folder: StorageFolder;
  /** Id del record collegato (arc_codi o cod_p): diventa il nome del file su Dropbox. */
  id: number;
  name: string;
  type: string;
  data: string;
}

/** File su Dropbox tramite il proxy FD_DropboxGateway.php. */
export abstract class FileStorageRepository {
  abstract upload(file: StorageUpload): Observable<void>;
  abstract delete(path: string): Observable<void>;
  /** Link temporaneo per visualizzare o scaricare il file. */
  abstract link(path: string): Observable<string>;
}

@Injectable()
export class DropboxFileStorageRepository extends FileStorageRepository {
  private readonly gateway = inject(GatewayClient);

  upload(file: StorageUpload): Observable<void> {
    return this.gateway
      .dropbox({
        mode: 1,
        path: file.folder,
        id: file.id,
        name: file.name,
        type: file.type,
        data: file.data,
      })
      .pipe(map(() => undefined));
  }

  delete(path: string): Observable<void> {
    return this.gateway.dropbox({ mode: 3, path }).pipe(map(() => undefined));
  }

  link(path: string): Observable<string> {
    return this.gateway
      .dropbox({ mode: 4, path })
      .pipe(map((response) => toText(response['link'])));
  }
}
