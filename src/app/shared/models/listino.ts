export interface Listino {
  id: number;
  descrizione: string;
  /** Aliquota IVA in percentuale. */
  aliquota: number;
}

/** Valori speciali del filtro categoria delle righe del listino. */
export const CategoriaListino = {
  Tutte: 0,
  SenzaCategoria: 999,
} as const;

/** Riga del listino (LISTINO_RIGHE). */
export interface ListinoRiga {
  id: number;
  listinoid: number;
  ingredienteid: number;
  descrizione: string;
  /** Scarto in percentuale. */
  scarto: number | null;
  /** Grammatura di riferimento del prezzo, in grammi. */
  grammatura: number | null;
  prezzo: number | null;
  categoriaid: number | null;
  categorianome: string | null;
  /** kcal per 100 g. */
  kcal: number | null;
  provenienza: string | null;
  /** Ricette che usano la voce (dal GROUP_CONCAT della vista). */
  ricette: string[];
}

/** Campi modificabili di una riga del listino (LISTINO_RIGA_UPDATE). */
export type ListinoRigaModifica = Pick<
  ListinoRiga,
  'id' | 'descrizione' | 'scarto' | 'grammatura' | 'prezzo' | 'categoriaid' | 'kcal' | 'provenienza'
>;
