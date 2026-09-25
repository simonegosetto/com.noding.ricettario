import { expect, test } from '@playwright/test';

import { loginAs, setupBackend } from './support/backend';

test('salva il blocco note con l’apostrofo raddoppiato', async ({ page }) => {
  const backend = await setupBackend(page);
  await loginAs(page);
  await page.goto('/home');

  const note = page.getByRole('textbox', { name: 'Blocco note' });
  await expect(note).toHaveValue('Ordinare la farina entro venerdì.');
  await note.fill("Chiamare l'idraulico");
  await page.getByRole('button', { name: 'Salva note' }).click();

  await expect(page.getByText('Note aggiornate')).toBeVisible();
  expect(backend.callsTo('NOTE_UPDATE')).toEqual(["'Chiamare l''idraulico'"]);
});

test('le scorciatoie portano alle pagine', async ({ page }) => {
  await setupBackend(page);
  await loginAs(page);
  await page.goto('/home');
  await expect(page.getByRole('link', { name: 'Schede tecniche' })).toHaveAttribute(
    'href',
    '/ricette?tipo=2',
  );
});
