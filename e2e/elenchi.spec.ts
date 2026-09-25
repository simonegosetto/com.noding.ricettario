import { expect, test } from '@playwright/test';

import { lastOpenedUrl, loginAs, recordWindowOpen, setupBackend } from './support/backend';

test.beforeEach(async ({ page }) => loginAs(page));

test.describe('ricette', () => {
  test('filtra, cambia tipo ed elimina con conferma', async ({ page }) => {
    const backend = await setupBackend(page);
    await page.goto('/ricette');

    await expect(page.getByText('Lasagne al forno')).toBeVisible();
    await page.getByPlaceholder('Cerca una ricetta').locator('input').fill('creme');
    await expect(page.getByText('Crème brûlée')).toBeVisible();
    await expect(page.getByText('Lasagne al forno')).toBeHidden();
    await page.getByPlaceholder('Cerca una ricetta').locator('input').fill('');

    await page.locator('ion-segment-button', { hasText: 'Schede tecniche' }).click();
    await expect(page).toHaveURL(/\/ricette\?tipo=2$/);
    await expect(page.getByText('Besciamella')).toBeVisible();
    expect(backend.callsTo('RICETTE_LIST')).toContain('2');

    await page.locator('ion-segment-button', { hasText: 'Ricette' }).click();
    await expect(page.getByText('Ragù alla bolognese')).toBeVisible();
    await page
      .locator('ric-list-row', { hasText: 'Ragù alla bolognese' })
      .getByRole('button', { name: 'Elimina' })
      .click();
    await page.getByRole('button', { name: 'Elimina' }).last().click();
    // Come nella versione legacy l'id viaggia come numero JSON.
    await expect.poll(() => backend.callsTo('RICETTA_DELETE')).toEqual([1]);
  });

  test('apre la stampa XML delle ricette semplici', async ({ page }) => {
    await setupBackend(page);
    await recordWindowOpen(page);
    await page.goto('/ricette');
    await page
      .locator('ric-list-row', { hasText: 'Ragù alla bolognese' })
      .getByRole('button', { name: 'Stampa' })
      .click();
    const url = new URL(await lastOpenedUrl(page));
    expect(url.searchParams.get('report')).toBe('ricetta.xml');
    expect(url.searchParams.get('params')).toBe('1');
    expect(url.searchParams.get('token')).toBe('e2e-session');
  });
});

test('crea un listino con aliquota e apostrofo', async ({ page }) => {
  const backend = await setupBackend(page);
  await page.goto('/listini');
  await page.getByRole('button', { name: 'Nuovo listino' }).click();

  const modal = page.locator('ion-modal');
  await modal.getByLabel('Nome').fill("Listino d'autunno");
  await modal.getByLabel('Aliquota IVA (%)').fill('10');
  await modal.getByRole('button', { name: 'Salva' }).click();

  await expect.poll(() => backend.callsTo('LISTINO_SAVE')).toEqual(["0,'Listino d''autunno',10"]);
  await expect(page.getByText('Listino salvato')).toBeVisible();
});

test('crea un menù evento', async ({ page }) => {
  const backend = await setupBackend(page);
  await page.goto('/menus');
  await expect(page.getByText('Matrimonio Rossi')).toBeVisible();
  await page.getByRole('button', { name: 'Nuovo menù' }).click();

  const modal = page.locator('ion-modal');
  await modal.getByLabel('Nome').fill('Cena aziendale');
  await modal.locator('ion-select').click();
  await page.getByRole('radio', { name: 'Evento' }).click();
  await modal.getByRole('button', { name: 'Salva' }).click();

  await expect.poll(() => backend.callsTo('MENU_INSERT')).toEqual(["0,'Cena aziendale',2,0,0"]);
});

test('rinomina una scheda di produzione', async ({ page }) => {
  const backend = await setupBackend(page);
  await page.goto('/schedeproduzione');
  await page
    .locator('ric-list-row', { hasText: 'Linea pasticceria' })
    .getByRole('button', { name: 'Modifica' })
    .click();

  const nome = page.locator('ion-modal').getByLabel('Nome');
  await expect(nome).toHaveValue('Linea pasticceria');
  await nome.fill('Linea pasticceria fresca');
  await page.locator('ion-modal').getByRole('button', { name: 'Salva' }).click();

  await expect.poll(() => backend.callsTo('SCHEDA_SAVE')).toEqual(["1,'Linea pasticceria fresca'"]);
});

test('il dizionario mostra 50 voci per volta e filtra senza accenti', async ({ page }) => {
  await setupBackend(page);
  await page.goto('/foodcost');
  await expect(page.locator('ric-foodcost ion-list ion-item')).toHaveCount(50);
  await page.getByPlaceholder('Cerca un alimento').locator('input').fill('creme fraiche');
  await expect(page.locator('ric-foodcost ion-list ion-item')).toHaveCount(17);
  await expect(page.getByText('Crème fraîche 7', { exact: true })).toBeVisible();
});
