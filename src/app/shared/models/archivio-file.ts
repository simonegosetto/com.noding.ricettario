/** Elemento della cartella corrente dell'archivio: cartella o file (ARCHIVIO_LIST). */
export interface ArchivioElemento {
  isCartella: boolean;
  /** Id della cartella (per le cartelle) o della cartella che contiene il file. */
  folderid: number;
  /** Id del file (arc_codi), 0 per le cartelle. */
  arc_codi: number;
  descrizione: string;
  /** Nome icona Ionicons indicato dal DB ('folder' per le cartelle). */
  icon: string;
  numero_file: number;
  numero_cartelle: number;
  /** Percorso del file su Dropbox. */
  id_storage: string | null;
}

/** Contenuto di una cartella con i dati della cartella stessa (parametri OUT). */
export interface ArchivioContenuto {
  /** Cartella richiesta (0 = radice dell'archivio). */
  folderId: number;
  elementi: ArchivioElemento[];
  folderName: string | null;
  parentId: number;
  parentName: string | null;
}

/** Cartella proposta come destinazione dello spostamento (ARCHIVIO_CARTELLE_TREE). */
export interface ArchivioCartella {
  id: number;
  descrizione: string;
}

/** Metadati del file caricato (ARCHIVIO_FILE_INSERT). */
export interface ArchivioNuovoFile {
  nome: string;
  folderid: number;
  size: number;
  type: string;
}
