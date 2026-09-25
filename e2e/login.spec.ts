import { expect, test } from '@playwright/test';

import { loginAs, setupBackend } from './support/backend';

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

  test('con il token rifiutato dal backend torna al login senza ricaricare', async ({ page }) => {
    const backend = await setupBackend(page);
    await loginAs(page);
    backend.on('LISTINI_LIST', { error: 'Token non valido' });
    await page.goto('/home');
    await expect(page.getByText('Ordinare la farina entro venerdì.')).toBeVisible();
    // Sparisce solo se la pagina viene ricaricata (la versione legacy faceva un reload).
    await page.evaluate(
      () => ((window as unknown as { __nessunReload: boolean }).__nessunReload = true),
    );
    await page.locator('ric-home').getByRole('link', { name: 'Listini prezzi' }).click();

    await expect(page).toHaveURL(/\/login$/);
    expect(
      await page.evaluate(() => (window as unknown as { __nessunReload?: boolean }).__nessunReload),
    ).toBe(true);
    await expect(page.locator('ion-toast', { hasText: 'Sessione scaduta' })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
  });

  test('esce dal menu laterale', async ({ page }) => {
    await setupBackend(page);
    await loginAs(page);
    await page.goto('/home');
    await expect(page.getByText('Ordinare la farina entro venerdì.')).toBeVisible();

    const menu = page.locator('ion-menu');
    if (!(await menu.getByText('Esci').isVisible())) {
      await page.locator('ion-menu-button').first().click();
    }
    await menu.getByText('Esci').click();

    await expect(page).toHaveURL(/\/login$/);
    expect(await page.evaluate(() => localStorage.getItem('user'))).toBeNull();
  });
});
