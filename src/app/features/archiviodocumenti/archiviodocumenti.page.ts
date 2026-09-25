import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonContent } from '@ionic/angular/ion-content';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonList } from '@ionic/angular/ion-list';
import { IonMenuButton } from '@ionic/angular/ion-menu-button';
import { IonRefresher } from '@ionic/angular/ion-refresher';
import { IonRefresherContent } from '@ionic/angular/ion-refresher-content';
import { IonSearchbar } from '@ionic/angular/ion-searchbar';
import { IonTitle } from '@ionic/angular/ion-title';
import { IonToolbar } from '@ionic/angular/ion-toolbar';
import type { ViewWillEnter } from '@ionic/angular';
import { catchError, concatMap, EMPTY, finalize, from, map, Observable, skip, tap } from 'rxjs';

import { errorMessage } from '../../core/api/gateway-error';
import { AlertService } from '../../core/ui/alert.service';
import { ModalService } from '../../core/ui/modal.service';
import { ToastService } from '../../core/ui/toast.service';
import { ArchivioRepository } from '../../data/archivio.repository';
import { resolveIcon } from '../../shared/icons';
import {
  DescrizioneModalResult,
  ModalDescrizioneComponent,
} from '../../shared/modal-descrizione/modal-descrizione.component';
import {
  ArchivioCartella,
  ArchivioContenuto,
  ArchivioElemento,
} from '../../shared/models/archivio-file';
import { NoextensionPipe } from '../../shared/pipes/noextension.pipe';
import { SearchModalComponent } from '../../shared/search-modal/search-modal.component';
import { cartelleSource } from '../../shared/search-modal/search-sources';
import { filterByText } from '../../shared/text-filter';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { ListRowComponent } from '../../shared/ui/list-row.component';
import { ListSkeletonComponent } from '../../shared/ui/list-skeleton.component';
import { RemoteList } from '../../shared/ui/remote-list';

/** Oltre questa dimensione il file (inviato in base64 dentro un JSON) non viene caricato. */
const MAX_FILE_MB = 25;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

type CartellaMostrata = Omit<ArchivioContenuto, 'elementi'>;

interface RigaArchivio {
  /** Cartelle e file hanno id da tabelle diverse. */
  chiave: string;
  elemento: ArchivioElemento;
  icona: string;
  dettaglio: string;
}

@Component({
  selector: 'ric-archiviodocumenti',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonList,
    IonMenuButton,
    IonRefresher,
    IonRefresherContent,
    IonSearchbar,
    IonTitle,
    IonToolbar,
    NoextensionPipe,
    EmptyStateComponent,
    ListRowComponent,
    ListSkeletonComponent,
  ],
  templateUrl: './archiviodocumenti.page.html',
  styleUrl: './archiviodocumenti.page.scss',
})
export class ArchiviodocumentiPage implements ViewWillEnter {
  private readonly repository = inject(ArchivioRepository);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly modals = inject(ModalService);
  private readonly alerts = inject(AlertService);
  private readonly toast = inject(ToastService);
  private readonly window = inject(DOCUMENT).defaultView;

  private readonly fonteCartelle = cartelleSource();
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  /**
   * Query param `?cartella=`: la cartella aperta sta nell'URL, così il tasto indietro del
   * browser risale di livello e un link porta direttamente alla cartella.
   */
  readonly cartella = input<string>();

  protected readonly maxFileMb = MAX_FILE_MB;
  private readonly cartellaId = computed(() => {
    const id = Number(this.cartella());
    return Number.isInteger(id) && id > 0 ? id : 0;
  });

  /**
   * Cartella dell'ultimo contenuto caricato: titolo, "Indietro", upload e nuove cartelle
   * seguono quello che l'utente vede, anche mentre la cartella successiva è in caricamento.
   */
  protected readonly mostrata = signal<CartellaMostrata>({
    folderId: 0,
    folderName: null,
    parentId: 0,
    parentName: null,
  });
  protected readonly titolo = computed(() => {
    const { folderId, folderName } = this.mostrata();
    return (folderId > 0 && folderName) || 'Archivio documenti';
  });
  protected readonly cartellaSuperiore = computed(() => {
    const { parentId, parentName } = this.mostrata();
    return parentId > 0 ? parentName || 'Cartella superiore' : 'Archivio documenti';
  });

  protected readonly elementi = new RemoteList(() =>
    this.repository.contenuto(this.cartellaId()).pipe(
      tap(({ folderId, folderName, parentId, parentName }) =>
        this.mostrata.set({ folderId, folderName, parentId, parentName }),
      ),
      map((contenuto) => contenuto.elementi),
    ),
  );
  protected readonly search = signal('');
  protected readonly righe = computed<RigaArchivio[]>(() =>
    filterByText(this.elementi.items(), this.search(), (elemento) => elemento.descrizione).map(
      (elemento) => ({
        chiave: elemento.isCartella ? `c${elemento.folderid}` : `f${elemento.arc_codi}`,
        elemento,
        icona: elemento.isCartella ? 'folder-outline' : resolveIcon(elemento.icon),
        dettaglio: elemento.isCartella
          ? riepilogo(elemento) || 'Vuota'
          : estensione(elemento.descrizione),
      }),
    ),
  );
  /** Nome del file in caricamento (null = nessun caricamento in corso). */
  protected readonly inCaricamento = signal<string | null>(null);

  constructor() {
    toObservable(this.cartellaId)
      .pipe(skip(1), takeUntilDestroyed())
      .subscribe(() => {
        this.search.set('');
        this.elementi.load();
      });
  }

  ionViewWillEnter(): void {
    this.elementi.load();
  }

  protected apri(elemento: ArchivioElemento): void {
    if (elemento.isCartella) {
      this.vaiA(elemento.folderid);
    } else {
      this.apriFile(elemento);
    }
  }

  protected risali(): void {
    this.vaiA(this.mostrata().parentId);
  }

  protected async nuovaCartella(): Promise<void> {
    const cartella = await this.modals.open<DescrizioneModalResult>(ModalDescrizioneComponent, {
      title: 'Nuova cartella',
      confirmText: 'Crea',
    });
    if (cartella) {
      this.esegui(
        this.repository.createFolder(cartella.descrizione, this.mostrata().folderId),
        'Cartella creata',
      );
    }
  }

  protected async rinomina(cartella: ArchivioElemento): Promise<void> {
    const modifica = await this.modals.open<DescrizioneModalResult>(ModalDescrizioneComponent, {
      title: 'Rinomina cartella',
      descrizione: cartella.descrizione,
    });
    if (modifica && modifica.descrizione !== cartella.descrizione) {
      this.esegui(
        this.repository.renameFolder(cartella.folderid, modifica.descrizione),
        'Cartella rinominata',
      );
    }
  }

  protected async eliminaCartella(cartella: ArchivioElemento): Promise<void> {
    const contenuto = riepilogo(cartella);
    const conferma = await this.alerts.confirm(
      'Elimina cartella',
      contenuto
        ? `La cartella «${cartella.descrizione}» contiene ${contenuto}: confermi di eliminarla con tutto il suo contenuto?`
        : `Confermi di eliminare la cartella «${cartella.descrizione}»?`,
      { confirmText: 'Elimina', cancelText: 'Annulla' },
    );
    if (conferma) {
      this.esegui(this.repository.deleteFolder(cartella.folderid), 'Cartella eliminata');
    }
  }

  protected async sposta(file: ArchivioElemento): Promise<void> {
    const destinazione = await this.modals.open<ArchivioCartella>(SearchModalComponent, {
      title: 'Sposta in un’altra cartella',
      placeholder: 'Cerca una cartella',
      source: this.fonteCartelle,
    });
    if (destinazione && destinazione.id !== file.folderid) {
      this.esegui(
        this.repository.moveFile(file.arc_codi, destinazione.id),
        `File spostato in «${destinazione.descrizione}»`,
      );
    }
  }

  protected async eliminaFile(file: ArchivioElemento): Promise<void> {
    const conferma = await this.alerts.confirm(
      'Elimina file',
      `Confermi di eliminare il file «${file.descrizione}»?`,
      { confirmText: 'Elimina', cancelText: 'Annulla' },
    );
    if (conferma) {
      this.esegui(this.repository.deleteFile(file), 'File eliminato');
    }
  }

  protected scegliFile(): void {
    this.fileInput().nativeElement.click();
  }

  /** Carica i file scelti uno alla volta nella cartella mostrata. */
  protected carica(input: HTMLInputElement): void {
    const scelti = Array.from(input.files ?? []);
    // Svuotato subito: così si può scegliere di nuovo lo stesso file.
    input.value = '';
    const troppoGrandi = scelti.filter((file) => file.size > MAX_FILE_BYTES);
    if (troppoGrandi.length) {
      const nomi = troppoGrandi.map((file) => `«${file.name}»`).join(', ');
      this.toast.error(`${nomi}: il limite è di ${MAX_FILE_MB} MB per file.`);
    }
    const daCaricare = scelti.filter((file) => file.size <= MAX_FILE_BYTES);
    if (!daCaricare.length) {
      return;
    }

    const cartellaId = this.mostrata().folderId;
    let caricati = 0;
    from(daCaricare)
      .pipe(
        concatMap((file) => {
          this.inCaricamento.set(file.name);
          return this.repository.uploadFile(cartellaId, file).pipe(
            tap(() => caricati++),
            catchError((error: unknown) => {
              this.toast.error(`«${file.name}» non caricato: ${errorMessage(error)}`);
              return EMPTY;
            }),
          );
        }),
        finalize(() => {
          this.inCaricamento.set(null);
          if (caricati) {
            this.toast.success(caricati === 1 ? 'File caricato' : `${caricati} file caricati`);
          }
          this.elementi.load();
        }),
      )
      .subscribe();
  }

  private apriFile(file: ArchivioElemento): void {
    // Aperta subito, dentro il click: aperta all'arrivo del link la bloccherebbe il browser.
    const finestra = this.window?.open('', '_blank') ?? null;
    if (finestra) {
      finestra.opener = null;
    }
    this.repository.fileLink(file).subscribe({
      next: (link) => {
        if (finestra && !finestra.closed) {
          finestra.location.replace(link);
        } else {
          this.window?.open(link, '_blank', 'noopener');
        }
      },
      error: (error: unknown) => {
        finestra?.close();
        this.toast.error(error);
      },
    });
  }

  private vaiA(cartellaId: number): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { cartella: cartellaId > 0 ? cartellaId : null },
    });
  }

  /** Esito in un toast; l'elenco si ricarica comunque (es. file eliminato dal DB ma non da Dropbox). */
  private esegui(operazione: Observable<void>, messaggio: string): void {
    operazione
      .pipe(
        this.toast.notifyErrors(),
        finalize(() => this.elementi.load()),
      )
      .subscribe(() => this.toast.success(messaggio));
  }
}

/** "2 cartelle e 3 file" ('' se la cartella è vuota). */
function riepilogo(cartella: ArchivioElemento): string {
  const parti: string[] = [];
  if (cartella.numero_cartelle > 0) {
    parti.push(
      cartella.numero_cartelle === 1 ? '1 cartella' : `${cartella.numero_cartelle} cartelle`,
    );
  }
  if (cartella.numero_file > 0) {
    parti.push(`${cartella.numero_file} file`);
  }
  return parti.join(' e ');
}

/** Estensione in maiuscolo ("menu.pdf" → "PDF"), '' se manca. */
function estensione(nome: string): string {
  const dot = nome.lastIndexOf('.');
  return dot > 0 && dot < nome.length - 1 ? nome.slice(dot + 1).toUpperCase() : '';
}
