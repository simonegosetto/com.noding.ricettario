import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { IonButton } from '@ionic/angular/ion-button';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonSpinner } from '@ionic/angular/ion-spinner';
import { catchError, finalize, from, of, switchMap } from 'rxjs';

import { AlertService } from '../../core/ui/alert.service';
import { ToastService } from '../../core/ui/toast.service';
import { readFileAsBase64 } from '../../data/file-reader';
import { FileStorageRepository, StorageFolder } from '../../data/file-storage.repository';
import { ridimensionaFoto } from '../../data/image-resize';

const TIPI_AMMESSI = ['image/png', 'image/jpeg'];
const MAX_FOTO_MB = 15;

/** Foto della ricetta su Dropbox (cartella `ricette/`, nome = cod_p). */
@Component({
  selector: 'ric-ricetta-immagine',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonButton, IonIcon, IonSpinner],
  template: `
    <div class="foto" [class.foto--vuota]="!link()">
      @if (link(); as src) {
        <img [src]="src" [alt]="'Foto di ' + nome()" />
      } @else if (idStorage()) {
        <ion-spinner name="crescent" aria-label="Caricamento della foto" />
      } @else {
        <ion-icon name="image-outline" aria-hidden="true" />
        <p>Nessuna foto</p>
      }
      @if (inCaricamento()) {
        <div class="foto__overlay" role="status">
          <ion-spinner name="crescent" />
          Caricamento…
        </div>
      }
    </div>
    <div class="foto__azioni">
      <ion-button fill="outline" size="small" [disabled]="inCaricamento()" (click)="scegli()">
        <ion-icon slot="start" name="cloud-upload-outline" />
        {{ idStorage() ? 'Cambia foto' : 'Carica foto' }}
      </ion-button>
      @if (idStorage()) {
        <ion-button
          fill="clear"
          size="small"
          color="danger"
          [disabled]="inCaricamento()"
          (click)="elimina()"
        >
          <ion-icon slot="start" name="trash-outline" />
          Elimina
        </ion-button>
      }
    </div>
    <input
      #fileInput
      type="file"
      accept="image/png,image/jpeg"
      hidden
      aria-label="Foto della ricetta"
      (change)="carica(fileInput)"
    />
  `,
  styleUrl: './ricetta-immagine.component.scss',
})
export class RicettaImmagineComponent {
  private readonly storage = inject(FileStorageRepository);
  private readonly alerts = inject(AlertService);
  private readonly toast = inject(ToastService);
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  readonly codP = input.required<number>();
  readonly idStorage = input<string | null>(null);
  readonly nome = input('');
  /** Foto caricata o eliminata: il chiamante ricarica la ricetta (id_storage aggiornato). */
  readonly cambiata = output();

  protected readonly inCaricamento = signal(false);
  protected readonly link = toSignal(
    toObservable(this.idStorage).pipe(
      switchMap((percorso) =>
        percorso ? this.storage.link(percorso).pipe(catchError(() => of(null))) : of(null),
      ),
    ),
    { initialValue: null },
  );

  protected scegli(): void {
    this.fileInput().nativeElement.click();
  }

  protected carica(input: HTMLInputElement): void {
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    if (!TIPI_AMMESSI.includes(file.type)) {
      this.toast.error('La foto deve essere un file PNG o JPEG.');
      return;
    }
    if (file.size > MAX_FOTO_MB * 1024 * 1024) {
      this.toast.error(`La foto non può superare ${MAX_FOTO_MB} MB.`);
      return;
    }
    this.inCaricamento.set(true);
    from(ridimensionaFoto(file))
      .pipe(
        switchMap((foto) => readFileAsBase64(foto)),
        switchMap((base64) =>
          this.storage.upload({
            folder: StorageFolder.Ricette,
            id: this.codP(),
            name: file.name,
            type: file.type,
            // Come nella versione legacy il proxy riconosce solo png e jpeg.
            data: `data:image/${file.type === 'image/png' ? 'png' : 'jpeg'};base64,${base64}`,
          }),
        ),
        finalize(() => this.inCaricamento.set(false)),
        this.toast.notifyErrors(),
      )
      .subscribe(() => {
        this.toast.success('Foto caricata');
        this.cambiata.emit();
      });
  }

  protected async elimina(): Promise<void> {
    const percorso = this.idStorage();
    if (!percorso) {
      return;
    }
    const conferma = await this.alerts.confirm(
      'Elimina foto',
      'Confermi di eliminare la foto della ricetta?',
      { confirmText: 'Elimina', cancelText: 'Annulla' },
    );
    if (conferma) {
      this.storage
        .delete(percorso)
        .pipe(this.toast.notifyErrors())
        .subscribe(() => this.cambiata.emit());
    }
  }
}
