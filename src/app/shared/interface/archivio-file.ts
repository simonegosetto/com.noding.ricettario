export interface ArchivioFile {
    arc_codi: number;
    arc_nome: string;
    arc_data: Date;
    arc_rnome: string;
    arc_ordi: number;
    arc_size: number;
    arc_type: string;
    folderid: number;
    parentid?: number;
    descrizione: string; // descrizione cartella
    numero_file?: number;
    numero_cartelle?: number;
    icon?: string;
    id_storage?: string;
}

export interface ArchivioFolder {
    id: number;
    path: string;
}
