export interface SchedaProduzione {
  id: number;
  descrizione: string;
}

/** Ricetta inserita in una scheda di produzione (SCHEDA_RIGHE). */
export interface SchedaProduzioneRiga {
  id: number;
  ricettaid: number;
}
