import { NoextensionPipe } from './noextension.pipe';

describe('NoextensionPipe', () => {
  const pipe = new NoextensionPipe();

  it('toglie solo l’ultima estensione', () => {
    expect(pipe.transform('menu.v2.pdf')).toBe('menu.v2');
    expect(pipe.transform('listino.xlsx')).toBe('listino');
  });

  it('lascia i nomi senza estensione e i file nascosti', () => {
    expect(pipe.transform('Cartella')).toBe('Cartella');
    expect(pipe.transform('.htaccess')).toBe('.htaccess');
  });

  it('gestisce i valori vuoti', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
