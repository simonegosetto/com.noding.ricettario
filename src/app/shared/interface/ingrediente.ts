export interface Ingrediente {
    id: number;
    descrizione: string;
}

export interface IngredienteListino extends Ingrediente {
    listinoid: number;
    scarto: number;
    grammatura: number;
    prezzo: number;
    categoriaid: number;
    kcal: number;
    provenienza?: string;
}

export type IngredienteRead = Readonly<Pick<Ingrediente, 'id' | 'descrizione'>>
