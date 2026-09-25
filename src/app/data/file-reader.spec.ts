import { firstValueFrom } from 'rxjs';

import { readFileAsBase64, toDataUrl } from './file-reader';

describe('readFileAsBase64', () => {
  it('restituisce il contenuto in base64 senza il prefisso del data URL', async () => {
    const file = new Blob(['Crème brûlée'], { type: 'text/plain' });
    const base64 = await firstValueFrom(readFileAsBase64(file));
    const bytes = new TextEncoder().encode('Crème brûlée');
    expect(base64).toBe(btoa(String.fromCharCode(...bytes)));
    expect(toDataUrl('text/plain', base64)).toBe(`data:text/plain;base64,${base64}`);
  });

  it('gestisce i file vuoti', async () => {
    expect(await firstValueFrom(readFileAsBase64(new Blob([])))).toBe('');
  });
});
