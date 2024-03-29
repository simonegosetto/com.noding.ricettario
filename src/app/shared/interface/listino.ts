export interface Listino {
    id: number;
    descrizione: string;
    aliquota: number;
}

export type ListinoRead = Readonly<Listino>;

export interface ListinoRiga {
    id: number;
    listinoid: number;
    ingredienteid: number;
    descrizione: string; // descrizione ingrediente
    scarco: number;
    grammatura: number;
    prezzo: number;
    categoriaid: number;
    categorianome: string;
    kcal: number;
    ricette?: string;
    provenienza?: string;
    //
    infoVisible: boolean;
}
