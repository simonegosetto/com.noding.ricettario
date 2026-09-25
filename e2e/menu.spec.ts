import { expect, test, type Locator, type Page } from '@playwright/test';

import { lastOpenedUrl, loginAs, recordWindowOpen, setupBackend } from './support/backend';

test.beforeEach(async ({ page }) => loginAs(page));

const pagina = (page: Page) => page.locator('ric-menu');

/** Trascina la maniglia di riordino di una riga sopra un'altra riga. */
async function trascina(page: Page, riga: Locator, destinazione: Locator): Promise<void> {
  const maniglia = await riga.locator('ion-reorder').boundingBox();
  const arrivo = await destinazione.boundingBox();
  if (!maniglia || !arrivo) {
    throw new Error('Righe non visibili');
  }
  const x = maniglia.x + maniglia.width / 2;
  await page.mouse.move(x, maniglia.y + maniglia.height / 2);
  await page.mouse.down();
  await page.mouse.move(x, arrivo.y + 4, { steps: 15 });
  await page.mouse.up();
}

test.describe('alla carta', () => {
  test('mostra i piatti per categoria con food cost e prezzo', async ({ page }) => {
    const backend = await setupBackend(page);
    await page.goto('/menu/1');

    await expect(pagina(page).locator('ion-title')).toHaveText('Carta invernale');
    await expect(pagina(page).locator('ion-item-divider').nth(0)).toHaveText('Primi');
    const lasagne = pagina(page).locator('ric-list-row', { hasText: 'Lasagne al forno' });
    await expect(lasagne).toContainText('3,20 €');
    await expect(lasagne).toContainText('14,00 €');
    await expect(pagina(page).locator('ric-list-row', { hasText: 'Crème brûlée' })).toContainText(
      '—',
    );
    // Righe caricate una volta sola, sul listino predefinito (l'ultimo).
    expect(backend.callsTo('MENU_ALLA_CARTA_RIGHE')).toEqual(['1,2']);

    await pagina(page).locator('ion-select.menu__listino').click();
    await page.getByRole('radio', { name: 'Listino 2024' }).click();
    await expect.poll(() => backend.callsTo('MENU_ALLA_CARTA_RIGHE')).toEqual(['1,2', '1,1']);
  });

  test('aggiunge un piatto nella categoria scelta ed elimina un piatto', async ({ page }) => {
    const backend = await setupBackend(page);
    await page.goto('/menu/1');
    await expect(pagina(page).getByText('Lasagne al forno')).toBeVisible();

    const aggiungi = pagina(page).getByRole('button', { name: 'Aggiungi piatto' });
    await expect(aggiungi).toBeDisabled();
    await pagina(page).locator('ion-select.menu__categoria').click();
    await page.getByRole('radio', { name: 'Dolci' }).click();
    await aggiungi.click();
    const modal = page.locator('ion-modal');
    await modal.locator('ion-searchbar input').fill('besc');
    await modal.getByText('Besciamella').click();
    await expect.poll(() => backend.callsTo('MENU_RIGA_INSERT')).toEqual(['1,10,3']);
    await expect(page.locator('ion-modal')).toHaveCount(0);

    await pagina(page)
      .locator('ric-list-row', { hasText: 'Crème brûlée' })
      .getByRole('button', { name: 'Elimina' })
      .click();
    await page.locator('ion-alert').getByRole('button', { name: 'Elimina' }).click();
    await expect.poll(() => backend.callsTo('MENU_RIGA_DELETE')).toEqual([32]);
  });

  test('stampa il menù sul listino scelto', async ({ page }) => {
    await setupBackend(page);
    await recordWindowOpen(page);
    await page.goto('/menu/1');
    await expect(pagina(page).getByText('Lasagne al forno')).toBeVisible();

    await pagina(page).getByRole('button', { name: 'Stampa' }).click();
    const url = new URL(await lastOpenedUrl(page));
    expect(url.searchParams.get('menu')).toBe('1');
    expect(url.searchParams.get('listino')).toBe('2');
    expect(url.searchParams.get('descrizione')).toBe('Carta invernale');
    expect(url.searchParams.get('token')).toBe('e2e-session');
  });
});

test.describe('evento', () => {
  test('riordina i piatti trascinandoli', async ({ page }) => {
    const backend = await setupBackend(page);
    await page.goto('/menu/2');
    const righe = pagina(page).locator('ion-reorder-group > ion-item');
    await expect(righe).toHaveCount(4);

    await trascina(page, righe.nth(3), righe.nth(0));

    await expect.poll(() => backend.callsTo('MENU_RIGA_MOVE')).toEqual(['44,1,2']);
    await expect(righe.nth(0)).toContainText('Crème brûlée');
    await expect(righe.nth(1)).toContainText('Ragù alla bolognese');
  });

  test('gestisce separatori, coperti e totali', async ({ page }) => {
    const backend = await setupBackend(page);
    await page.goto('/menu/2');
    const riepilogo = pagina(page).locator('.evento__riepilogo');
    await expect(riepilogo.getByRole('row', { name: /Costo/ })).toContainText('8,50 €');
    await expect(riepilogo.getByRole('row', { name: /Costo/ })).toContainText('680,00 €');
    await expect(riepilogo.getByRole('row', { name: /Prezzo lordo/ })).toContainText('3.200,00 €');

    await pagina(page)
      .locator('ion-item', { hasText: 'Ragù alla bolognese' })
      .getByRole('button', { name: 'Separatore sotto' })
      .click();
    await expect.poll(() => backend.callsTo('MENU_SEPARATORE_INSERT')).toEqual(['41,2']);

    await pagina(page).getByRole('button', { name: 'Elimina separatore' }).click();
    await page.locator('ion-alert').getByRole('button', { name: 'Elimina' }).click();
    await expect.poll(() => backend.callsTo('MENU_SEPARATORE_DELETE')).toEqual([43]);

    const pax = riepilogo.getByLabel('Coperti (pax)');
    await expect(pax).toHaveValue('80');
    await pax.fill('-5');
    await pax.press('Enter');
    await expect(page.locator('ion-toast', { hasText: 'numero di coperti intero' })).toBeVisible();
    await expect(pax).toHaveValue('80');

    await pax.fill('100');
    await pax.press('Enter');
    await expect.poll(() => backend.callsTo('MENU_COPERTI_UPDATE')).toEqual(['2,100,10']);
    await expect.poll(() => backend.callsTo('MENU_TOTALI').length).toBe(2);
  });

  test('stampa lista della spesa, food cost e distinta base', async ({ page }) => {
    await setupBackend(page);
    await recordWindowOpen(page);
    await page.goto('/menu/2');
    await expect(pagina(page).getByText('Lasagne al forno')).toBeVisible();

    await pagina(page).getByRole('button', { name: 'Stampa' }).click();
    await page.getByRole('button', { name: 'Lista della spesa' }).click();
    let url = new URL(await lastOpenedUrl(page));
    expect(url.searchParams.get('menu')).toBe('2');
    expect(url.searchParams.has('foodcost')).toBe(false);
    expect(url.searchParams.has('bom')).toBe(false);

    await expect(page.locator('ion-action-sheet')).toHaveCount(0);
    await pagina(page).getByRole('button', { name: 'Stampa' }).click();
    await page.getByRole('button', { name: 'Con food cost' }).click();
    await expect
      .poll(async () => new URL(await lastOpenedUrl(page)).searchParams.get('foodcost'))
      .toBe('1');
    url = new URL(await lastOpenedUrl(page));
    expect(url.searchParams.get('foodcost')).toBe('1');
    expect(url.searchParams.get('menu')).toBe('2');

    await expect(page.locator('ion-action-sheet')).toHaveCount(0);
    await pagina(page).getByRole('button', { name: 'Stampa' }).click();
    await page.getByRole('button', { name: 'Distinta base (BOM)' }).click();
    await expect
      .poll(async () => new URL(await lastOpenedUrl(page)).searchParams.get('bom'))
      .toBe('1');
    url = new URL(await lastOpenedUrl(page));
    expect(url.searchParams.get('foodcost')).toBeNull();
  });
});
