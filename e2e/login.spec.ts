import { expect, test } from '@playwright/test';

import { setupBackend } from './support/backend';

test.describe('login', () => {
  test('accede e mostra il nome dell’utente nel menu', async ({ page }) => {
    const backend = await setupBackend(page);
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);

    await page.getByLabel('Username').fill('mario');
    await page.getByLabel('Password', { exact: true }).fill('segreta');
    await page.getByRole('button', { name: 'Accedi' }).click();

    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByText('Ordinare la farina entro venerdì.')).toBeVisible();
    expect(backend.callsTo('NOTE_GET')).toEqual(['']);
    expect(await page.evaluate(() => localStorage.getItem('token'))).toBe('e2e-session');
  });

  test('mostra l’errore del backend', async ({ page }) => {
    const backend = await setupBackend(page);
    backend.onLogin({ error: 'Utente o password errati' });
    await page.goto('/login');

    await page.getByLabel('Username').fill('mario');
    await page.getByLabel('Password', { exact: true }).fill('sbagliata');
    await page.keyboard.press('Enter');

    await expect(page.getByText('Utente o password errati')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});
