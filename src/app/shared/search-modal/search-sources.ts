import { inject } from '@angular/core';

import { ArchivioRepository } from '../../data/archivio.repository';
import { IngredientiRepository } from '../../data/ingredienti.repository';
import { MenuRepository } from '../../data/menu.repository';
import { RicetteRepository } from '../../data/ricette.repository';
import { ArchivioCartella } from '../models/archivio-file';
import { Ingrediente } from '../models/ingrediente';
import { Menu } from '../models/menu';
import { RicettaCercata } from '../models/ricetta';
import { SearchSource } from './search-source';

/*
 * Sorgenti del modale di ricerca, con le stesse regole dei modali legacy.
 * Vanno create in un contesto di injection (es. inizializzatore di un campo del componente).
 */

/** Ricette (sotto-ricette di una ricetta, ricette di una scheda di produzione). */
export function ricetteSource(): SearchSource<RicettaCercata> {
  const repository = inject(RicetteRepository);
  return {
    mode: 'server',
    minChars: 3,
    load: (text) => repository.search(text),
    label: (ricetta) => ricetta.nome_ric,
    key: (ricetta) => ricetta.cod_p,
  };
}

/** Schede tecniche (righe del listino, piatti dei menù). */
export function schedeTecnicheSource(): SearchSource<RicettaCercata> {
  const repository = inject(RicetteRepository);
  return {
    mode: 'server',
    minChars: 3,
    load: (text) => repository.searchSchedeTecniche(text),
    label: (ricetta) => ricetta.nome_ric,
    key: (ricetta) => ricetta.cod_p,
  };
}

/** Ingredienti per le righe della ricetta: elenco completo filtrato localmente. */
export function ingredientiRicettaSource(): SearchSource<Ingrediente> {
  const repository = inject(IngredientiRepository);
  return {
    mode: 'client',
    minChars: 3,
    load: () => repository.all(),
    label: (ingrediente) => ingrediente.descrizione,
    key: (ingrediente) => ingrediente.id,
  };
}

/** Ingredienti da aggiungere a un listino: ricerca sul server. */
export function ingredientiListinoSource(): SearchSource<Ingrediente> {
  const repository = inject(IngredientiRepository);
  return {
    mode: 'server',
    minChars: 3,
    load: (text) => repository.search(text),
    label: (ingrediente) => ingrediente.descrizione,
    key: (ingrediente) => ingrediente.id,
  };
}

/** Menù da cui importare le righe di un listino. */
export function menuSource(): SearchSource<Menu> {
  const repository = inject(MenuRepository);
  return {
    mode: 'client',
    minChars: 0,
    load: () => repository.list(),
    label: (menu) => menu.descrizione,
    key: (menu) => menu.id,
  };
}

/** Cartelle di destinazione per lo spostamento di un file. */
export function cartelleSource(): SearchSource<ArchivioCartella> {
  const repository = inject(ArchivioRepository);
  return {
    mode: 'client',
    minChars: 0,
    load: () => repository.cartelle(),
    label: (cartella) => cartella.descrizione,
    key: (cartella) => cartella.id,
  };
}
