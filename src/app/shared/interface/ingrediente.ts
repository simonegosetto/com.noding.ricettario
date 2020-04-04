export interface Ingrediente {
    id: number;
    descrizione: string;
    edibile: number;
    grammatura: number;
    prezzo: number;
    categoriaid: number;
}

export type IngredienteRead = Readonly<Pick<Ingrediente, 'id' | 'descrizione'>>
