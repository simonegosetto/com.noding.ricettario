/** Voce del dizionario ingredienti con i valori nutrizionali (DIZIONARIO_ALIMENTI). */
export interface Alimento {
  descrizione: string;
  kcal: number | null;
  /** Parte edibile in percentuale. */
  edibile: number | null;
  proteine: number | null;
  proteineAnimali: number | null;
  proteineVegetali: number | null;
  glucidi: number | null;
  amidi: number | null;
  lipidi: number | null;
}
