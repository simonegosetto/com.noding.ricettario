import { expect, test, type Page } from '@playwright/test';

import { lastOpenedUrl, loginAs, recordWindowOpen, setupBackend } from './support/backend';

test.beforeEach(async ({ page }) => loginAs(page));

const pagina = (page: Page) => page.locator('ric-archiviodocumenti');
const riga = (page: Page, testo: string) =>
  pagina(page).locator('ric-list-row', { hasText: testo });
const titolo = (page: Page) => pagina(page).locator('ion-title');
const cartellaRichiesta = (params: string | number) => String(params).split(',')[0];

test("naviga nelle cartelle tenendo la cartella nell'URL", async ({ page }) => {
  const backend = await setupBackend(page);
  await page.goto('/archiviodocumenti');

  await expect(titolo(page)).toHaveText('Archivio documenti');
  await expect(riga(page, 'Fatture')).toContainText('1 cartella e 2 file');
  await expect(riga(page, 'Listino fornitori')).toContainText('PDF');
  await expect(pagina(page).getByText('Listino fornitori.pdf')).toHaveCount(0);

  await riga(page, 'Fatture').locator('ion-item').click();
  await expect(page).toHaveURL(/\/archiviodocumenti\?cartella=5$/);
  await expect(titolo(page)).toHaveText('Fatture');
  await expect(riga(page, 'Indietro')).toContainText('Archivio documenti');

  await riga(page, '2024').locator('ion-item').click();
  await expect(titolo(page)).toHaveText('2024');
  await expect(riga(page, 'Indietro')).toContainText('Fatture');
  await expect(pagina(page).getByText('Questa cartella è vuota.')).toBeVisible();

  // Il tasto indietro del browser risale di un livello.
  await page.goBack();
  await expect(titolo(page)).toHaveText('Fatture');

  await riga(page, 'Indietro').locator('ion-item').click();
  await expect(page).toHaveURL(/\/archiviodocumenti$/);
  await expect(titolo(page)).toHaveText('Archivio documenti');
  expect(backend.callsTo('ARCHIVIO_LIST').map(cartellaRichiesta)).toEqual([
    '0',
    '5',
    '7',
    '5',
    '0',
  ]);
});

test("carica un file: prima il record nel DB, poi Dropbox con l'id restituito", async ({
  page,
}) => {
  const backend = await setupBackend(page);
  await page.goto('/archiviodocumenti?cartella=5');
  await expect(titolo(page)).toHaveText('Fatture');

  const contenuto = Buffer.from('%PDF-1.4 e2e');
  await pagina(page)
    .locator('input[type=file]')
    .setInputFiles({
      name: "Menu dell'estate.pdf",
      mimeType: 'application/pdf',
      buffer: contenuto,
    });

  await expect(page.locator('ion-toast', { hasText: 'File caricato' })).toBeVisible();
  expect(backend.callsTo('ARCHIVIO_FILE_INSERT')).toEqual([
    `'Menu dell''estate.pdf','Menu dell''estate.pdf',5,${contenuto.length},'application/pdf',@out_id`,
  ]);
  expect(backend.dropboxCalls).toEqual([
    {
      mode: 1,
      path: 'documenti/',
      id: 201,
      name: "Menu dell'estate.pdf",
      type: 'application/pdf',
      data: `data:application/pdf;base64,${contenuto.toString('base64')}`,
    },
  ]);
  await expect
    .poll(() => backend.callsTo('ARCHIVIO_LIST').map(cartellaRichiesta))
    .toEqual(['5', '5']);
});

test('se Dropbox rifiuta il file, il record appena creato viene rimosso', async ({ page }) => {
  const backend = await setupBackend(page);
  backend.onDropbox(1, { error: 'Spazio Dropbox esaurito' });
  await page.goto('/archiviodocumenti');
  await expect(riga(page, 'Fatture')).toBeVisible();

  await pagina(page)
    .locator('input[type=file]')
    .setInputFiles({
      name: 'contratto.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('x'),
    });

  await expect(page.locator('ion-toast', { hasText: 'Spazio Dropbox esaurito' })).toBeVisible();
  expect(backend.callsTo('ARCHIVIO_FILE_DELETE')).toEqual([201]);
});

test('apre il file con il link temporaneo di Dropbox', async ({ page }) => {
  const backend = await setupBackend(page);
  backend.onDropbox(4, { link: 'https://dl.example.test/listino.pdf' });
  await recordWindowOpen(page);
  await page.goto('/archiviodocumenti');

  await riga(page, 'Listino fornitori').locator('ion-item').click();

  expect(await lastOpenedUrl(page)).toBe('https://dl.example.test/listino.pdf');
  expect(backend.dropboxCalls).toEqual([{ mode: 4, path: 'id:e2e-101' }]);
});

test("sposta un file in un'altra cartella", async ({ page }) => {
  const backend = await setupBackend(page);
  await page.goto('/archiviodocumenti');

  await riga(page, 'Foto sala').getByRole('button', { name: 'Sposta' }).click();
  await page.locator('ion-modal').getByText('Fatture/2024').click();

  await expect.poll(() => backend.callsTo('ARCHIVIO_FILE_MOVE')).toEqual(['102,7']);
  await expect(
    page.locator('ion-toast', { hasText: 'File spostato in «Fatture/2024»' }),
  ).toBeVisible();
});

test('elimina un file dal DB e poi da Dropbox', async ({ page }) => {
  const backend = await setupBackend(page);
  await page.goto('/archiviodocumenti');

  await riga(page, 'Listino fornitori').getByRole('button', { name: 'Elimina' }).click();
  await page.locator('ion-alert').getByRole('button', { name: 'Elimina' }).click();

  await expect.poll(() => backend.dropboxCalls).toEqual([{ mode: 3, path: 'id:e2e-101' }]);
  expect(backend.callsTo('ARCHIVIO_FILE_DELETE')).toEqual([101]);
});

test('crea, rinomina ed elimina le cartelle', async ({ page }) => {
  const backend = await setupBackend(page);
  await page.goto('/archiviodocumenti');
  await expect(riga(page, 'Manuali')).toBeVisible();

  await pagina(page).getByRole('button', { name: 'Nuova cartella' }).click();
  await page.locator('ion-modal').getByLabel('Nome').fill('Preventivi');
  await page.locator('ion-modal').getByRole('button', { name: 'Crea' }).click();
  await expect.poll(() => backend.callsTo('ARCHIVIO_CARTELLA_INSERT')).toEqual(["'Preventivi',0"]);
  await expect(page.locator('ion-modal')).toHaveCount(0);

  await riga(page, 'Manuali').getByRole('button', { name: 'Rinomina' }).click();
  const nome = page.locator('ion-modal').getByLabel('Nome');
  await expect(nome).toHaveValue('Manuali');
  await nome.fill("Manuali d'uso");
  await page.locator('ion-modal').getByRole('button', { name: 'Salva' }).click();
  await expect
    .poll(() => backend.callsTo('ARCHIVIO_CARTELLA_RENAME'))
    .toEqual(["6,'Manuali d''uso'"]);

  await riga(page, 'Fatture').getByRole('button', { name: 'Elimina' }).click();
  const alert = page.locator('ion-alert');
  await expect(alert).toContainText('contiene 1 cartella e 2 file');
  await alert.getByRole('button', { name: 'Elimina' }).click();
  await expect.poll(() => backend.callsTo('ARCHIVIO_CARTELLA_DELETE')).toEqual(['5']);
});
