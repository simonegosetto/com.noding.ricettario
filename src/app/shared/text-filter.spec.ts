import { filterByText } from './text-filter';

describe('filterByText', () => {
  const ricette = [{ nome: 'Crème brûlée' }, { nome: 'Ragù alla bolognese' }, { nome: 'Pesto' }];

  it('ignora maiuscole e accenti', () => {
    expect(filterByText(ricette, 'CREME', (r) => r.nome)).toEqual([{ nome: 'Crème brûlée' }]);
    expect(filterByText(ricette, 'ragu', (r) => r.nome)).toEqual([{ nome: 'Ragù alla bolognese' }]);
  });

  it('restituisce tutto con testo vuoto o nullo', () => {
    expect(filterByText(ricette, '', (r) => r.nome)).toHaveLength(3);
    expect(filterByText(ricette, null, (r) => r.nome)).toHaveLength(3);
    expect(filterByText(ricette, '   ', (r) => r.nome)).toHaveLength(3);
  });

  it('tollera campi mancanti', () => {
    expect(filterByText([{ nome: null }, { nome: 'Pesto' }], 'pe', (r) => r.nome)).toEqual([
      { nome: 'Pesto' },
    ]);
  });
});
