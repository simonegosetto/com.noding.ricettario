import { NavigationError } from '@angular/router';

const LAST_RELOAD_KEY = 'ricettario:chunk-reload';
const CHUNK_ERROR =
  /dynamically imported module|Importing a module script failed|error loading dynamically/i;

/**
 * Dopo un nuovo deploy una scheda aperta da tempo può chiedere chunk che non esistono più:
 * in quel caso ricarica la pagina (al massimo una volta ogni 10 secondi, per evitare cicli).
 */
export function reloadOnChunkError(error: NavigationError): void {
  if (!CHUNK_ERROR.test(String(error.error))) {
    return;
  }
  try {
    const last = Number(sessionStorage.getItem(LAST_RELOAD_KEY) ?? 0);
    if (Date.now() - last < 10_000) {
      return;
    }
    sessionStorage.setItem(LAST_RELOAD_KEY, String(Date.now()));
  } catch {
    // sessionStorage non disponibile: ricarica comunque
  }
  location.reload();
}
