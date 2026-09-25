import { resolveIcon } from './icons';

describe('resolveIcon', () => {
  it('usa la variante outline delle icone registrate', () => {
    expect(resolveIcon('folder')).toBe('folder-outline');
    expect(resolveIcon('document-text')).toBe('document-text-outline');
  });

  it('converte i nomi di Ionicons 4 e i prefissi ios-/md-', () => {
    expect(resolveIcon('filing')).toBe('file-tray-full-outline');
    expect(resolveIcon('md-undo')).toBe('arrow-undo-outline');
    expect(resolveIcon('ios-photos')).toBe('images-outline');
  });

  it('ricade sull’icona documento per i nomi sconosciuti', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(resolveIcon('logo-pdf')).toBe('document-outline');
    expect(resolveIcon(null)).toBe('document-outline');
  });
});
