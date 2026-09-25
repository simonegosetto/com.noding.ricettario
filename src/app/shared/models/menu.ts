export const TipoMenu = {
  AllaCarta: 1,
  Evento: 2,
} as const;
export type TipoMenu = (typeof TipoMenu)[keyof typeof TipoMenu];

export interface Menu {
  id: number;
  descrizione: string;
  tipo: TipoMenu;
  pax: number | null;
  /** Percentuale della scheda tecnica usata nel calcolo dei totali dell'evento. */
  perc_ricetta: number | null;
}

/** Dati del modale di creazione/modifica di un menù. */
export type MenuSalvataggio = Pick<Menu, 'id' | 'descrizione' | 'tipo'>;

/**
 * Riga del menù alla carta (MENU_ALLA_CARTA_RIGHE): il DB restituisce le intestazioni
 * di categoria (tipo 1) intercalate ai piatti (tipo 2).
 */
export type RigaMenuAllaCarta =
  | { kind: 'categoria'; id: number; categoria: string }
  | {
      kind: 'piatto';
      id: number;
      ricettaid: number;
      descrizione: string;
      foodcost: number | null;
      prezzo_lordo_vendita: number | null;
    };

/** Riga del menù evento (MENU_EVENTO_RIGHE): piatti (tipo 1) e separatori (tipo 2). */
export type RigaMenuEvento =
  | { kind: 'piatto'; id: number; ricettaid: number; descrizione: string }
  | { kind: 'separatore'; id: number };

/** Totali del menù evento per coperto e per menù (MENU_TOTALI). */
export interface MenuTotali {
  foodcost: number | null;
  netto: number | null;
  iva: number | null;
  lordo: number | null;
  foodcost_tot: number | null;
  netto_tot: number | null;
  lordo_tot: number | null;
}
