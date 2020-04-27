export interface Menu {
    id: number;
    descrizione: string;
    pax: number;
    perc_ricetta: number;
    tipo: number;
}

export type MenuRead = Readonly<Menu>;
