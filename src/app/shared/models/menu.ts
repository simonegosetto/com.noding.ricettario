export interface Menu {
    id: number;
    descrizione: string;
    pax: number;
    perc_ricetta: number;
    tipo: number;
}

export type MenuRead = Readonly<Menu>;

export interface MenuRiga {
    id: number;
    menuid: number;
    ricettaid: number;
    nome_ric: string;
    menucategoriaid: number;
}

export interface MenuRigaSearch extends MenuRiga {
    tipo: number;
    descrizione: string;
    categoria: string;
    prezzo_lordo_vendita: number;
    foodcost: number;
}

export interface MenuTotali {
    foodcost: number;
    netto: number;
    iva: number;
    lordo: number;
    foodcost_tot: number;
    netto_tot: number;
    iva_tot: number;
    lordo_tot: number;
}
