import { Provider } from '@angular/core';

import { ArchivioRepository, GatewayArchivioRepository } from './archivio.repository';
import { DizionarioRepository, GatewayDizionarioRepository } from './dizionario.repository';
import { DropboxFileStorageRepository, FileStorageRepository } from './file-storage.repository';
import { GatewayIngredientiRepository, IngredientiRepository } from './ingredienti.repository';
import { GatewayListiniRepository, ListiniRepository } from './listini.repository';
import { GatewayMenuRepository, MenuRepository } from './menu.repository';
import { GatewayNoteRepository, NoteRepository } from './note.repository';
import { GatewayRicetteRepository, RicetteRepository } from './ricette.repository';
import {
  GatewaySchedeProduzioneRepository,
  SchedeProduzioneRepository,
} from './schede-produzione.repository';

/**
 * Implementazioni dei repository. Oggi parlano con il gateway PHP; con il backend NestJS
 * basterà registrare qui le nuove implementazioni, senza toccare le pagine.
 */
export function provideRepositories(): Provider[] {
  return [
    { provide: NoteRepository, useClass: GatewayNoteRepository },
    { provide: RicetteRepository, useClass: GatewayRicetteRepository },
    { provide: IngredientiRepository, useClass: GatewayIngredientiRepository },
    { provide: ListiniRepository, useClass: GatewayListiniRepository },
    { provide: MenuRepository, useClass: GatewayMenuRepository },
    { provide: SchedeProduzioneRepository, useClass: GatewaySchedeProduzioneRepository },
    { provide: ArchivioRepository, useClass: GatewayArchivioRepository },
    { provide: DizionarioRepository, useClass: GatewayDizionarioRepository },
    { provide: FileStorageRepository, useClass: DropboxFileStorageRepository },
  ];
}
