import { CanDeactivateFn } from '@angular/router';

/** Pagina con un form che si può perdere uscendo (es. editor della ricetta). */
export interface ConModificheNonSalvate {
  /** `true` se si può uscire: niente modifiche, o l'utente ha confermato di abbandonarle. */
  puoUscire(): boolean | Promise<boolean>;
}

export const unsavedChangesGuard: CanDeactivateFn<ConModificheNonSalvate> = (component) =>
  component?.puoUscire?.() ?? true;
