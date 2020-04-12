export interface Ingrediente {
    id: number;
    descrizione: string;
    scarto: number;
    grammatura: number;
    prezzo: number;
    categoriaid: number;
    kcal: number;
}

export interface IngredienteListino extends Ingrediente{
    listinoid: number;
}

export type IngredienteRead = Readonly<Pick<Ingrediente, 'id' | 'descrizione'>>
