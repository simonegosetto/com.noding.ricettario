import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { ConModificheNonSalvate, unsavedChangesGuard } from './unsaved-changes.guard';

describe('unsavedChangesGuard', () => {
  const run = (component: ConModificheNonSalvate | null) =>
    unsavedChangesGuard(
      component as ConModificheNonSalvate,
      {} as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot,
      {} as RouterStateSnapshot,
    );

  it('lascia uscire se il componente non ha modifiche', () => {
    expect(run({ puoUscire: () => true })).toBe(true);
  });

  it('usa la risposta del componente (anche asincrona)', async () => {
    expect(run({ puoUscire: () => false })).toBe(false);
    await expect(run({ puoUscire: () => Promise.resolve(false) })).resolves.toBe(false);
  });

  it('lascia uscire se il componente non c’è più', () => {
    expect(run(null)).toBe(true);
  });
});
