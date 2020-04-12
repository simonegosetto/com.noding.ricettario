export interface Listino {
    id: number;
    descrizione: string;
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
}
