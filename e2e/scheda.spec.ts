import { expect, test, type Page } from '@playwright/test';

import { lastOpenedUrl, loginAs, recordWindowOpen, setupBackend } from './support/backend';

test.beforeEach(async ({ page }) => loginAs(page));

const card = (page: Page, testo: string) =>
  page.locator('ric-schedaproduzione ric-ricetta-card', { hasText: testo });

test('mostra le ricette della scheda con ingredienti e procedimento', async ({ page }) => {
  const backend = await setupBackend(page);
  await page.goto('/schedaproduzione/1');

  await expect(page.locator('ric-schedaproduzione ion-title')).toHaveText('Linea pasticceria');
  const lasagne = card(page, 'Lasagne al forno');
  await expect(lasagne.getByRole('row', { name: /Besciamella/ })).toContainText('800 g');
  await expect(lasagne.getByRole('row', { name: /Besciamella/ })).toContainText('32%');
  await expect(lasagne).toContainText('Cuocere a 180 °C per 40 minuti.');
  await expect(lasagne.getByRole('link', { name: 'Lasagne al forno' })).toHaveAttribute(
    'href',
    '/ricetta/2',
  );
  await expect(card(page, 'Crème brûlée').getByRole('row', { name: /Zucchero/ })).toContainText(
    '30 g',
  );
  // Testata e righe di ogni ricetta arrivano in parallelo, una volta sola.
  expect(backend.callsTo('SCHEDA_RIGHE')).toEqual(['1']);
  expect([...backend.callsTo('RICETTA_GET')].sort()).toEqual(['2', '3']);
  expect([...backend.callsTo('RICETTA_RIGHE')].sort()).toEqual(['2', '3']);
});

test('stampa con e senza food cost sul listino scelto', async ({ page }) => {
  await setupBackend(page);
  await recordWindowOpen(page);
  await page.goto('/schedaproduzione/1');
  await expect(card(page, 'Lasagne al forno')).toBeVisible();

  await page.getByRole('button', { name: 'Stampa', exact: true }).click();
  let url = new URL(await lastOpenedUrl(page));
  expect(url.pathname).toMatch(/FD_SchedaTecnicaPrinter\.php$/);
  expect(url.searchParams.get('params')).toBe('2,3');
  expect(url.searchParams.get('foodcost')).toBe('0');
  // Come nella versione legacy il listino predefinito è l'ultimo.
  expect(url.searchParams.get('listino')).toBe('2');
  expect(url.searchParams.get('descrizione')).toBe('Linea pasticceria');

  await page.locator('ion-select.scheda__listino').click();
  await page.getByRole('radio', { name: 'Listino 2024' }).click();
  await page.getByRole('button', { name: 'Stampa con food cost' }).click();
  await expect
    .poll(async () => new URL(await lastOpenedUrl(page)).searchParams.get('listino'))
    .toBe('1');
  url = new URL(await lastOpenedUrl(page));
  expect(url.searchParams.get('foodcost')).toBe('1');
});

test('aggiunge una ricetta cercandola e ne toglie una', async ({ page }) => {
  const backend = await setupBackend(page);
  await page.goto('/schedaproduzione/1');
  await expect(card(page, 'Crème brûlée')).toBeVisible();

  await page.getByRole('button', { name: 'Aggiungi ricetta' }).first().click();
  const modal = page.locator('ion-modal');
  await modal.locator('ion-searchbar input').fill('rag');
  await modal.getByText('Ragù alla bolognese').click();
  await expect.poll(() => backend.callsTo('SCHEDA_RIGA_INSERT')).toEqual(['1,1']);
  await expect(page.locator('ion-modal')).toHaveCount(0);

  await card(page, 'Crème brûlée').getByRole('button', { name: 'Togli dalla scheda' }).click();
  await page.locator('ion-alert').getByRole('button', { name: 'Togli' }).click();
  await expect.poll(() => backend.callsTo('SCHEDA_RIGA_DELETE')).toEqual([22]);
});
