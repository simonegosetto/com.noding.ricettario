import { expect, test } from '@playwright/test';

import { lastOpenedUrl, loginAs, recordWindowOpen, setupBackend } from './support/backend';

test.beforeEach(async ({ page }) => loginAs(page));

test('mostra le righe con titolo, valori e informazioni', async ({ page }) => {
  const backend = await setupBackend(page);
  await page.goto('/listino/1');

  await expect(page.locator('ion-title', { hasText: 'Listino 2024' })).toBeVisible();
  const farina = page.locator('ric-list-row', { hasText: 'Farina 00' });
  await expect(farina).toContainText('0,90 €');
  await farina.getByRole('button', { name: 'Dettagli' }).click();
  await expect(farina).toContainText('Molino Rossi');
  await expect(farina).toContainText('Lasagne al forno, Pane casereccio');
  expect(backend.callsTo('LISTINO_RIGHE')).toEqual(['1,0']);
});

test('filtra per categoria sul server e stampa con la categoria scelta', async ({ page }) => {
  const backend = await setupBackend(page);
  await recordWindowOpen(page);
  await page.goto('/listino/1');
  await expect(page.getByText('Burro')).toBeVisible();

  await page.locator('ion-select.listino__categoria').click();
  await page.getByRole('radio', { name: 'Senza categoria' }).click();
  await expect.poll(() => backend.callsTo('LISTINO_RIGHE')).toEqual(['1,0', '1,999']);

  await page.getByRole('button', { name: 'Stampa' }).click();
  const url = new URL(await lastOpenedUrl(page));
  expect(url.pathname).toMatch(/FD_ReportListino\.php$/);
  expect(url.searchParams.get('params')).toBe('1');
  expect(url.searchParams.get('categoria')).toBe('999');
});

test('modifica una riga con il modale', async ({ page }) => {
  const backend = await setupBackend(page);
  await page.goto('/listino/1');
  await page
    .locator('ric-list-row', { hasText: 'Burro' })
    .getByRole('button', { name: 'Modifica' })
    .click();

  const modal = page.locator('ion-modal');
  await expect(modal.getByLabel('Nome')).toHaveValue('Burro');
  await modal.getByLabel('Prezzo (€)').fill('2.6');
  await modal.getByLabel('Provenienza').fill("Latteria dell'Alpe");
  await modal.getByRole('button', { name: 'Salva' }).click();

  await expect
    .poll(() => backend.callsTo('LISTINO_RIGA_UPDATE'))
    .toEqual(["12,5,250,2.6,NULL,717,'Burro','Latteria dell''Alpe'"]);
});

test('aggiunge un ingrediente e le righe di un menù', async ({ page }) => {
  const backend = await setupBackend(page);
  await page.goto('/listino/1');
  await expect(page.getByText('Burro')).toBeVisible();

  await page.getByRole('button', { name: 'Aggiungi al listino' }).click();
  await page.getByRole('button', { name: 'Ingrediente' }).click();
  const modal = page.locator('ion-modal');
  await modal.locator('ion-searchbar input').fill('farro');
  await modal.getByText('Farina di farro').click();
  await expect.poll(() => backend.callsTo('LISTINO_ADD_INGREDIENTE')).toEqual(['1,7']);
  expect(backend.callsTo('INGREDIENTI_SEARCH')).toEqual(["'farro'"]);

  await page.getByRole('button', { name: 'Aggiungi al listino' }).click();
  await page.getByRole('button', { name: 'Righe di un menù' }).click();
  await page.locator('ion-modal').getByText('Matrimonio Rossi').click();
  // La stored procedure vuole prima il menù e poi il listino.
  await expect.poll(() => backend.callsTo('LISTINO_ADD_MENU')).toEqual(['2,1']);
});

test('elimina una riga con conferma', async ({ page }) => {
  const backend = await setupBackend(page);
  await page.goto('/listino/1');
  await page
    .locator('ric-list-row', { hasText: 'Burro' })
    .getByRole('button', { name: 'Elimina' })
    .click();
  await page.locator('ion-alert').getByRole('button', { name: 'Elimina' }).click();
  await expect.poll(() => backend.callsTo('LISTINO_RIGA_DELETE')).toEqual([12]);
});
