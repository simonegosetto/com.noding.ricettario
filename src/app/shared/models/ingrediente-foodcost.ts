export interface IngredienteFoodcost {
    listinoid: number;
    ingredienteid: number;
    descrizione: string;
    ricettaid: number;
    peso: number;
    foodcost: number;
    kcal: number;
}

export type IngredienteFoodcostRead = Readonly<Pick<IngredienteFoodcost, 'descrizione' | 'peso' | 'foodcost' | 'kcal'>>
