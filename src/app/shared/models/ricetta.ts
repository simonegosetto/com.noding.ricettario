/** Tipo di ricetta usato dal filtro dell'elenco (RICETTE_LIST). */
export const TipoRicetta = {
  Ricetta: 1,
  SchedaTecnica: 2,
} as const;
export type TipoRicetta = (typeof TipoRicetta)[keyof typeof TipoRicetta];

/** Riga dell'elenco ricette. */
export interface RicettaListItem {
  cod_p: number;
  nome_ric: string;
  /** Ricetta con sotto-ricette: la stampa usa il report HTML invece dell'XML. */
  composta: boolean;
}

/** Testata della ricetta (RICETTA_GET). */
export interface Ricetta {
  cod_p: number;
  nome_ric: string;
  procedimento: string | null;
  prezzo_vendita: number | null;
  peso_effettivo: number | null;
  /** Percorso dell'immagine su Dropbox, se presente. */
  id_storage: string | null;
}

/** Dati inviati al salvataggio della testata (RICETTA_SAVE). */
export type RicettaSalvataggio = Pick<
  Ricetta,
  'cod_p' | 'nome_ric' | 'procedimento' | 'prezzo_vendita' | 'peso_effettivo'
>;

/** Riga ingrediente della ricetta (RICETTA_RIGHE). */
export interface RicettaRiga {
  id: number;
  nome: string;
  quantita: number | null;
  /** Percentuale sul peso totale, calcolata dal DB. */
  perc: number | null;
  /** Sotto-ricetta collegata, 0 se la riga non è una sotto-ricetta. */
  ricettaid: number;
  escludi_peso: boolean;
}

/** Nuova riga: da ricerca ricette, da ricerca ingredienti o libera (ricettaid e ingredienteid a 0). */
export interface NuovaRicettaRiga {
  nome: string;
  quantita: number | null;
  ricettaid: number;
  ingredienteid: number;
}

/** Risultato delle ricerche di ricette e schede tecniche. */
export interface RicettaCercata {
  cod_p: number;
  nome_ric: string;
}
