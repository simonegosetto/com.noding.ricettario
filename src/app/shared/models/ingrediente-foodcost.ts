/** Riga del pannello food cost di una ricetta per un listino (RICETTA_FOODCOST_RIGHE). */
export interface IngredienteFoodcost {
  descrizione: string;
  peso: number;
  kcal: number;
  foodcost: number;
}

/** Totali del food cost di una ricetta per un listino (RICETTA_FOODCOST_TOTALI). */
export interface FoodcostTotali {
  peso: number;
  foodcost: number;
  kcal: number;
  peso_effettivo: number | null;
  prezzo_lordo_vendita: number | null;
  ratio: number | null;
  prezzo_netto_vendita: number | null;
  margine_netto: number | null;
}
