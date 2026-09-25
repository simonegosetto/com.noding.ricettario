/** Utente autenticato restituito da FD_Login.php e salvato in localStorage. */
export interface Utente {
  nome?: string;
  cognome?: string;
  [campo: string]: unknown;
}
