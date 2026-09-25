import { expect, test, type Locator, type Page } from '@playwright/test';

import { lastOpenedUrl, loginAs, recordWindowOpen, setupBackend } from './support/backend';
import { RIGHE_RICETTA } from './support/fixtures';

test.beforeEach(async ({ page }) => loginAs(page));

const pagina = (page: Page) => page.locator('ric-ricetta').last();
const riga = (page: Page, testo: string) =>
  pagina(page).locator('ric-ricetta-ingredienti ion-item', { hasText: testo });
/** Su touch Ionic affianca per un attimo all'input un clone disabilitato (scroll assist). */
const campo = (locator: Locator) => locator.and(locator.page().locator(':not(.cloned-input)'));
const quantita = (riga: Locator) => campo(riga.locator('ion-input input'));

/** 1×1 px PNG valido. */
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

async function trascina(page: Page, da: Locator, a: Locator): Promise<void> {
  const maniglia = await da.locator('ion-reorder').boundingBox();
  const arrivo = await a.boundingBox();
  if (!maniglia || !arrivo) {
    throw new Error('Righe non visibili');
  }
  const x = maniglia.x + maniglia.width / 2;
  await page.mouse.move(x, maniglia.y + maniglia.height / 2);
  await page.mouse.down();
  await page.mouse.move(x, arrivo.y + 4, { steps: 15 });
  await page.mouse.up();
}

test('mostra testata, righe, sotto-ricette, foto e food cost', async ({ page }) => {
  await setupBackend(page);
  await page.goto('/ricetta/2');

  await expect(pagina(page).locator('ion-title')).toHaveText('Lasagne al forno');
  await expect(pagina(page).getByLabel('Nome della ricetta')).toHaveValue('Lasagne al forno');
  const ragu = riga(page, 'Ragù alla bolognese');
  await expect(ragu).toContainText('sotto-ricetta');
  await expect(ragu.getByRole('link')).toHaveAttribute('href', '/ricetta/1');
  await expect(quantita(ragu)).toHaveValue('1200');
  await expect(riga(page, "Sfoglia all'uovo")).toContainText('20%');

  const sottoricette = pagina(page).locator('ric-ricetta-card');
  await expect(sottoricette).toHaveCount(2);
  await expect(sottoricette.nth(1)).toContainText('Latte intero');

  const foto = pagina(page).locator('ric-ricetta-immagine img');
  await expect(foto).toHaveAttribute('src', 'https://dl.example.test/file.png');

  const foodcost = pagina(page).locator('ric-ricetta-foodcost');
  await expect(foodcost.locator('tfoot')).toContainText('11,25 €');
  await expect(campo(foodcost.getByLabel('Prezzo di vendita IVA incl. (€)'))).toHaveValue('12');
  await expect(foodcost).toContainText('34,38%');
});

test('crea una nuova ricetta e passa al suo id senza lasciare /ricetta/0', async ({ page }) => {
  const backend = await setupBackend(page);
  backend.on('RICETTA_GET', (codP: string | number) => ({
    recordset: [
      {
        cod_p: Number(codP),
        nome_ric: "Pasta all'amatriciana",
        procedimento: 'Rosolare il guanciale.',
        prezzo_vendita: 0,
        peso_effettivo: 0,
        id_storage: null,
      },
    ],
  }));
  await page.goto('/ricette');
  await page.getByRole('button', { name: 'Nuova ricetta' }).click();
  await expect(page).toHaveURL(/\/ricetta\/0$/);
  await expect(pagina(page).locator('ion-title')).toHaveText('Nuova ricetta');
  await expect(pagina(page).getByText('Dopo il primo salvataggio')).toBeVisible();

  await pagina(page).getByLabel('Nome della ricetta').fill("Pasta all'amatriciana");
  await pagina(page).getByLabel('Procedimento').fill('Rosolare il guanciale.');
  await pagina(page).getByRole('button', { name: 'Crea ricetta' }).click();

  await expect(page).toHaveURL(/\/ricetta\/99$/);
  expect(backend.callsTo('RICETTA_SAVE')).toEqual([
    "0,'Pasta all''amatriciana','Rosolare il guanciale.',0,0,@out_id",
  ]);
  await expect(pagina(page).locator('ric-ricetta-ingredienti')).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/ricette$/);
});

test('modifica quantità, esclusione dal peso e ordine delle righe', async ({ page }) => {
  const backend = await setupBackend(page);
  await page.goto('/ricetta/1');
  await expect(riga(page, 'Soffritto')).toBeVisible();
  const totaliIniziali = backend.callsTo('RICETTA_FOODCOST_TOTALI').length;

  await quantita(riga(page, 'Soffritto')).fill('150');
  await quantita(riga(page, 'Soffritto')).press('Enter');
  await expect
    .poll(() => backend.callsTo('RICETTA_RIGA_UPDATE'))
    .toEqual(["3,'Soffritto',150,0,1,0"]);
  // Il food cost si ricalcola dopo ogni modifica delle righe.
  await expect
    .poll(() => backend.callsTo('RICETTA_FOODCOST_TOTALI').length)
    .toBeGreaterThan(totaliIniziali);

  await riga(page, 'Passata di pomodoro').locator('ion-checkbox').click();
  await expect
    .poll(() => backend.callsTo('RICETTA_RIGA_UPDATE').at(-1))
    .toBe("2,'Passata di pomodoro',700,0,1,1");

  const righe = pagina(page).locator('ric-ricetta-ingredienti ion-reorder-group > ion-item');
  await trascina(page, righe.nth(2), righe.nth(0));
  await expect.poll(() => backend.callsTo('RICETTA_RIGA_MOVE')).toEqual(['3,1,1']);
  await expect(righe.nth(0)).toContainText('Soffritto');
});

test('aggiunge ingredienti, sotto-ricette e righe libere', async ({ page }) => {
  const backend = await setupBackend(page);
  const righe = [...RIGHE_RICETTA[1]];
  backend.on('RICETTA_RIGHE', () => ({ recordset: righe }));
  backend.on('RICETTA_RIGA_INSERT', (params: string | number) => {
    const nome = String(params).split(',')[0].replace(/^'|'$/g, '').replace(/''/g, "'");
    righe.push({
      id: 100 + righe.length,
      nome,
      quantita: 1,
      perc: null,
      ricettaid: 0,
      escludi_peso: 0,
    });
    return {};
  });
  await page.goto('/ricetta/1');
  await expect(riga(page, 'Soffritto')).toBeVisible();

  await pagina(page).getByRole('button', { name: 'Ingrediente', exact: true }).click();
  const modal = page.locator('ion-modal');
  await modal.locator('ion-searchbar input').fill('farr');
  await modal.getByText('Farina di farro').click();
  await expect
    .poll(() => backend.callsTo('RICETTA_RIGA_INSERT'))
    .toEqual(["'Farina di farro',1,0,1,7"]);
  // Il cursore va sulla quantità della riga appena aggiunta.
  await expect(quantita(riga(page, 'Farina di farro'))).toBeFocused();
  await expect(page.locator('ion-modal')).toHaveCount(0);

  await pagina(page).getByRole('button', { name: 'Sotto-ricetta' }).click();
  await page.locator('ion-modal').locator('ion-searchbar input').fill('lasa');
  await page.locator('ion-modal').getByText('Lasagne al forno').click();
  await expect
    .poll(() => backend.callsTo('RICETTA_RIGA_INSERT').at(-1))
    .toBe("'Lasagne al forno',1,2,1,0");
  await expect(page.locator('ion-modal')).toHaveCount(0);

  // Una ricetta non può diventare sotto-ricetta di se stessa.
  await pagina(page).getByRole('button', { name: 'Sotto-ricetta' }).click();
  await page.locator('ion-modal').locator('ion-searchbar input').fill('rag');
  await page.locator('ion-modal').getByText('Ragù alla bolognese').click();
  await expect(page.locator('ion-toast', { hasText: 'non può contenere se stessa' })).toBeVisible();
  expect(backend.callsTo('RICETTA_RIGA_INSERT')).toHaveLength(2);

  await pagina(page).getByLabel('Riga libera').fill('Sale q.b.');
  await pagina(page).getByRole('button', { name: 'Aggiungi', exact: true }).click();
  await expect
    .poll(() => backend.callsTo('RICETTA_RIGA_INSERT').at(-1))
    .toBe("'Sale q.b.',0,0,1,0");
});

test('il prezzo dal food cost resta anche salvando poi la testata', async ({ page }) => {
  const backend = await setupBackend(page);
  await page.goto('/ricetta/2');
  const prezzo = campo(pagina(page).getByLabel('Prezzo di vendita IVA incl. (€)'));
  await expect(prezzo).toHaveValue('12');

  await prezzo.fill('15');
  await prezzo.press('Enter');
  const procedimento = 'Alternare sfoglia, ragù e besciamella.\nCuocere a 180 °C per 40 minuti.';
  await expect
    .poll(() => backend.callsTo('RICETTA_SAVE'))
    .toEqual([`2,'Lasagne al forno','${procedimento}',15,2500,@out_id`]);

  await campo(pagina(page).getByLabel('Nome della ricetta')).fill('Lasagne della nonna');
  await expect(pagina(page).getByText('Modifiche non salvate')).toBeVisible();
  await pagina(page).getByRole('button', { name: 'Salva', exact: true }).last().click();
  // La versione legacy qui rimetteva il prezzo letto all'apertura (14).
  await expect
    .poll(() => backend.callsTo('RICETTA_SAVE').at(-1))
    .toBe(`2,'Lasagne della nonna','${procedimento}',15,2500,@out_id`);
  await expect(pagina(page).locator('ion-title')).toHaveText('Lasagne della nonna');
});

test('carica la foto su Dropbox ed elimina quella esistente', async ({ page }) => {
  const backend = await setupBackend(page);
  await page.goto('/ricetta/1');
  const foto = pagina(page).locator('ric-ricetta-immagine');
  await expect(foto).toContainText('Nessuna foto');

  await foto.locator('input[type=file]').setInputFiles({
    name: 'ragu.png',
    mimeType: 'image/png',
    buffer: PNG,
  });
  await expect.poll(() => backend.dropboxCalls.length).toBe(1);
  expect(backend.dropboxCalls[0]).toEqual({
    mode: 1,
    path: 'ricette/',
    id: 1,
    name: 'ragu.png',
    type: 'image/png',
    data: `data:image/png;base64,${PNG.toString('base64')}`,
  });

  await page.goto('/ricetta/2');
  await pagina(page)
    .locator('ric-ricetta-immagine')
    .getByRole('button', { name: 'Elimina' })
    .click();
  await page.locator('ion-alert').getByRole('button', { name: 'Elimina' }).click();
  await expect
    .poll(() => backend.dropboxCalls.filter((call) => call.mode === 3))
    .toEqual([{ mode: 3, path: 'id:e2e-img-2' }]);
});

test('chiede conferma prima di uscire con modifiche non salvate', async ({ page }) => {
  await setupBackend(page);
  await page.goto('/ricette');
  await page.getByText('Ragù alla bolognese').click();
  await expect(page).toHaveURL(/\/ricetta\/1$/);
  await pagina(page).getByLabel('Nome della ricetta').fill('Ragù di nonna Pina');

  await pagina(page).locator('ion-back-button').click();
  const alert = page.locator('ion-alert');
  await expect(alert).toContainText('Modifiche non salvate');
  await alert.getByRole('button', { name: 'Resta' }).click();
  await expect(page).toHaveURL(/\/ricetta\/1$/);
  await expect(page.locator('ion-alert')).toHaveCount(0);

  await pagina(page).locator('ion-back-button').click();
  await page.locator('ion-alert').getByRole('button', { name: 'Esci senza salvare' }).click();
  await expect(page).toHaveURL(/\/ricette$/);
});

test('stampa HTML con food cost le ricette composte, XML le altre', async ({ page }) => {
  await setupBackend(page);
  await recordWindowOpen(page);
  await page.goto('/ricetta/2');
  await expect(riga(page, 'Besciamella')).toBeVisible();

  await pagina(page).getByRole('button', { name: 'Stampa con food cost' }).click();
  let url = new URL(await lastOpenedUrl(page));
  expect(url.searchParams.get('report')).toBe('ricetta.html');
  expect(url.searchParams.get('foodcost')).toBe('1');
  expect(url.searchParams.get('listino')).toBe('2');
  expect(url.searchParams.get('params')).toBe('2');

  await page.goto('/ricetta/3');
  await expect(riga(page, 'Tuorli')).toBeVisible();
  await expect(pagina(page).getByRole('button', { name: 'Stampa con food cost' })).toHaveCount(0);
  await pagina(page).getByRole('button', { name: 'Stampa', exact: true }).click();
  url = new URL(await lastOpenedUrl(page));
  expect(url.searchParams.get('report')).toBe('ricetta.xml');
  expect(url.searchParams.get('params')).toBe('3');
});
