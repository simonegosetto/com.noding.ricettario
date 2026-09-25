import { isDevMode } from '@angular/core';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  alertCircleOutline,
  archiveOutline,
  arrowDownOutline,
  arrowUndoOutline,
  attachOutline,
  basketOutline,
  bookOutline,
  calculatorOutline,
  clipboardOutline,
  closeOutline,
  cloudDownloadOutline,
  cloudOfflineOutline,
  cloudUploadOutline,
  codeSlashOutline,
  createOutline,
  documentOutline,
  documentTextOutline,
  easelOutline,
  fileTrayFullOutline,
  filmOutline,
  folderOpenOutline,
  folderOutline,
  gridOutline,
  homeOutline,
  imageOutline,
  imagesOutline,
  informationCircleOutline,
  layersOutline,
  listOutline,
  logOutOutline,
  logoEuro,
  moveOutline,
  musicalNotesOutline,
  newspaperOutline,
  printOutline,
  readerOutline,
  refreshOutline,
  restaurantOutline,
  saveOutline,
  searchOutline,
  trashOutline,
  videocamOutline,
} from 'ionicons/icons';

/**
 * Con Ionic standalone le icone non vengono scaricate da `svg/`: vanno registrate.
 * `addIcons` registra anche il nome kebab-case (`addCircleOutline` → `add-circle-outline`).
 */
const APP_ICONS = {
  addCircleOutline,
  alertCircleOutline,
  archiveOutline,
  arrowDownOutline,
  arrowUndoOutline,
  attachOutline,
  basketOutline,
  bookOutline,
  calculatorOutline,
  clipboardOutline,
  closeOutline,
  cloudDownloadOutline,
  cloudOfflineOutline,
  cloudUploadOutline,
  codeSlashOutline,
  createOutline,
  documentOutline,
  documentTextOutline,
  easelOutline,
  fileTrayFullOutline,
  filmOutline,
  folderOpenOutline,
  folderOutline,
  gridOutline,
  homeOutline,
  imageOutline,
  imagesOutline,
  informationCircleOutline,
  layersOutline,
  listOutline,
  logOutOutline,
  logoEuro,
  moveOutline,
  musicalNotesOutline,
  newspaperOutline,
  printOutline,
  readerOutline,
  refreshOutline,
  restaurantOutline,
  saveOutline,
  searchOutline,
  trashOutline,
  videocamOutline,
};

export function registerAppIcons(): void {
  addIcons(APP_ICONS);
}

const REGISTERED = new Set(
  Object.keys(APP_ICONS).map((name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()),
);

/** Nomi di Ionicons 4 salvati nel DB che in Ionicons 5+ sono stati rinominati o rimossi. */
const LEGACY_ALIASES: Record<string, string> = {
  filing: 'file-tray-full',
  undo: 'arrow-undo',
  'arrow-round-down': 'arrow-down',
  paper: 'newspaper',
  photos: 'images',
  'list-box': 'list',
  'document-attach': 'attach',
  'musical-note': 'musical-notes',
};

const WARNED = new Set<string>();

/**
 * Converte un nome icona arrivato dal DB (archivio documenti) in una icona registrata,
 * nella variante outline usata nel resto dell'app. Nomi sconosciuti → icona documento.
 */
export function resolveIcon(
  name: string | null | undefined,
  fallback = 'document-outline',
): string {
  const base = (name ?? '')
    .trim()
    .toLowerCase()
    .replace(/^(ios|md)-/, '')
    .replace(/-(outline|sharp)$/, '');
  const candidate = `${LEGACY_ALIASES[base] ?? base}-outline`;
  if (REGISTERED.has(candidate)) {
    return candidate;
  }
  if (base && isDevMode() && !WARNED.has(base)) {
    WARNED.add(base);
    console.warn(`[icone] "${name}" non è registrata: uso ${fallback}`);
  }
  return fallback;
}
