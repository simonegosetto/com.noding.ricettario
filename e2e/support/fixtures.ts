import type { ProcessName } from '../../src/app/core/api/gateway-processes';

/** Dati sintetici con la forma delle risposte reali del gateway (mai dati o token di produzione). */

export const LISTINI = [
  { id: 1, descrizione: 'Listino 2024', aliquota: 10 },
  { id: 2, descrizione: 'Listino estate 2025', aliquota: 10 },
];

export const MENU = [
  { id: 1, descrizione: 'Carta invernale', tipo: 1, pax: 0, perc_ricetta: 0 },
  { id: 2, descrizione: 'Matrimonio Rossi', tipo: 2, pax: 80, perc_ricetta: 10 },
];

export const SCHEDE = [
  { id: 1, descrizione: 'Linea pasticceria' },
  { id: 2, descrizione: 'Pranzo di Natale' },
];

export const RICETTE = [
  { cod_p: 1, nome_ric: 'Ragù alla bolognese', composta: 0 },
  { cod_p: 2, nome_ric: 'Lasagne al forno', composta: 1 },
  { cod_p: 3, nome_ric: 'Crème brûlée', composta: 0 },
];

export const SCHEDE_TECNICHE = [{ cod_p: 10, nome_ric: 'Besciamella', composta: 0 }];

const NOMI_ALIMENTI = ['Farina', 'Zucchero', 'Burro', 'Uova', 'Latte', 'Panna', 'Crème fraîche'];

export const ALIMENTI = Array.from({ length: 120 }, (_, i) => ({
  Ali_desc: `${NOMI_ALIMENTI[i % NOMI_ALIMENTI.length]} ${i + 1}`,
  Ali_kcal: 100 + i,
  Ali_edi: 100,
  Ali_prot: 10.5,
  Ali_anim: 2,
  Ali_veg: 8.5,
  Ali_glu: 70.25,
  Ali_amid: 60,
  Ali_lup: 1.2,
}));

export const CATEGORIE_INGREDIENTI = [
  { id: 1, descrizione: 'Farine' },
  { id: 2, descrizione: 'Latticini' },
];

export const RIGHE_LISTINO = [
  {
    id: 11,
    listinoid: 1,
    ingredienteid: 5,
    descrizione: 'Farina 00',
    scarto: 0,
    grammatura: 1000,
    prezzo: 0.9,
    categoriaid: 1,
    categorianome: 'Farine',
    kcal: 340,
    provenienza: 'Molino Rossi',
    ricette: 'Lasagne al forno<p></p>Pane casereccio',
  },
  {
    id: 12,
    listinoid: 1,
    ingredienteid: 6,
    descrizione: 'Burro',
    scarto: 5,
    grammatura: 250,
    prezzo: 2.35,
    categoriaid: null,
    categorianome: null,
    kcal: 717,
    provenienza: null,
    ricette: null,
  },
];

export const INGREDIENTI = [
  { id: 5, descrizione: 'Farina 00' },
  { id: 7, descrizione: 'Farina di farro' },
  { id: 8, descrizione: 'Zucchero semolato' },
];

export const DEFAULT_RESPONSES: Partial<Record<ProcessName, (params: string | number) => unknown>> =
  {
    NOTE_GET: () => ({ recordset: [{ note: 'Ordinare la farina entro venerdì.' }] }),
    LISTINI_LIST: () => ({ recordset: LISTINI }),
    MENU_LIST: () => ({ recordset: MENU }),
    SCHEDE_LIST: () => ({ recordset: SCHEDE }),
    RICETTE_LIST: (tipo) => ({ recordset: String(tipo) === '2' ? SCHEDE_TECNICHE : RICETTE }),
    DIZIONARIO_ALIMENTI: () => ({ recordset: ALIMENTI }),
    CATEGORIE_INGREDIENTI_LIST: () => ({ recordset: CATEGORIE_INGREDIENTI }),
    LISTINO_RIGHE: () => ({ recordset: RIGHE_LISTINO }),
    INGREDIENTI_LIST: () => ({ recordset: INGREDIENTI }),
    INGREDIENTI_SEARCH: (testo) => ({
      recordset: INGREDIENTI.filter((i) => i.descrizione.toLowerCase().includes(unquote(testo))),
    }),
    RICETTE_SEARCH: (testo) => ({
      recordset: RICETTE.filter((r) => r.nome_ric.toLowerCase().includes(unquote(testo))),
    }),
    SCHEDE_TECNICHE_SEARCH: (testo) => ({
      recordset: SCHEDE_TECNICHE.filter((r) => r.nome_ric.toLowerCase().includes(unquote(testo))),
    }),
  };

/** Testo di un parametro stringa del gateway ('...') in minuscolo. */
function unquote(param: string | number): string {
  return String(param).replace(/^'|'$/g, '').replace(/''/g, "'").toLowerCase();
}
