/**
 * Filtro testuale usato dagli elenchi: ignora maiuscole e accenti ("creme" trova "Crème").
 * Sostituisce le pipe legacy `descrizione`, `ricette` e `foodcost`, che fallivano con testo nullo.
 */
export function filterByText<T>(
  items: readonly T[],
  text: string | null | undefined,
  pick: (item: T) => string | null | undefined,
): T[] {
  const needle = normalizeText(text);
  if (!needle) {
    return [...items];
  }
  return items.filter((item) => normalizeText(pick(item)).includes(needle));
}

export function normalizeText(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}
