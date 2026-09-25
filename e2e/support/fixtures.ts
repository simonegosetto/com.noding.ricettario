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

export const DEFAULT_RESPONSES: Partial<Record<ProcessName, (params: string | number) => unknown>> =
  {
    NOTE_GET: () => ({ recordset: [{ note: 'Ordinare la farina entro venerdì.' }] }),
    LISTINI_LIST: () => ({ recordset: LISTINI }),
    MENU_LIST: () => ({ recordset: MENU }),
    SCHEDE_LIST: () => ({ recordset: SCHEDE }),
    RICETTE_LIST: (tipo) => ({ recordset: String(tipo) === '2' ? SCHEDE_TECNICHE : RICETTE }),
    DIZIONARIO_ALIMENTI: () => ({ recordset: ALIMENTI }),
  };
