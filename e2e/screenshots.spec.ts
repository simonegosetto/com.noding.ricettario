import { test } from '@playwright/test';

import { loginAs, setupBackend } from './support/backend';

/**
 * Screenshot delle pagine con dati sintetici, per la revisione visiva:
 * `npm run e2e:screenshots` → test-results/screenshots/<progetto>/<pagina>.png
 */
const PAGES: { name: string; url: string; public?: boolean }[] = [
  { name: 'login', url: '/login', public: true },
  { name: 'home', url: '/home' },
];

for (const scheme of ['light', 'dark'] as const) {
  for (const { name, url, public: isPublic } of PAGES) {
    test(`screenshot ${name} (${scheme})`, async ({ page }, info) => {
      await page.emulateMedia({ colorScheme: scheme });
      await setupBackend(page);
      if (!isPublic) {
        await loginAs(page);
      }
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(400);
      await page.screenshot({
        path: `test-results/screenshots/${info.project.name}/${name}-${scheme}.png`,
        fullPage: true,
      });
    });
  }
}
