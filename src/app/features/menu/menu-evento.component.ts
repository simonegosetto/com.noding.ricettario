import { CurrencyPipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { IonButton } from '@ionic/angular/ion-button';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonInput } from '@ionic/angular/ion-input';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonList } from '@ionic/angular/ion-list';
import { IonReorder } from '@ionic/angular/ion-reorder';
import { IonReorderGroup } from '@ionic/angular/ion-reorder-group';
import { IonRouterLinkWithHref } from '@ionic/angular/ion-router-link';
import type { InputCustomEvent, ReorderEndCustomEvent } from '@ionic/angular';
import { finalize, Observable } from 'rxjs';

import { AlertService } from '../../core/ui/alert.service';
import { ModalService } from '../../core/ui/modal.service';
import { ToastService } from '../../core/ui/toast.service';
import { MenuRepository } from '../../data/menu.repository';
import { Menu, RigaMenuEvento } from '../../shared/models/menu';
import { RicettaCercata } from '../../shared/models/ricetta';
import { SearchModalComponent } from '../../shared/search-modal/search-modal.component';
import { schedeTecnicheSource } from '../../shared/search-modal/search-sources';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { ListSkeletonComponent } from '../../shared/ui/list-skeleton.component';
import { RemoteList, RemoteValue } from '../../shared/ui/remote-list';

type Piatto = Extract<RigaMenuEvento, { kind: 'piatto' }>;
type Separatore = Extract<RigaMenuEvento, { kind: 'separatore' }>;

/**
 * Menù evento: piatti in ordine (trascinabili) con separatori, coperti, percentuale della
 * scheda tecnica e totali per coperto e per menù sul listino scelto.
 */
@Component({
  selector: 'ric-menu-evento',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    DecimalPipe,
    RouterLink,
    IonButton,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonReorder,
    IonReorderGroup,
    IonRouterLinkWithHref,
    EmptyStateComponent,
    ListSkeletonComponent,
  ],
  templateUrl: './menu-evento.component.html',
  styleUrl: './menu-sezioni.scss',
})
export class MenuEventoComponent {
  private readonly repository = inject(MenuRepository);
  private readonly modals = inject(ModalService);
  private readonly alerts = inject(AlertService);
  private readonly toast = inject(ToastService);

  private readonly fonteSchede = schedeTecnicheSource();

  readonly menu = input.required<Menu>();
  readonly listinoId = input.required<number>();

  private readonly menuId = computed(() => this.menu().id);
  protected readonly righe = new RemoteList(() =>
    this.repository.righeEvento(this.menuId(), this.listinoId()),
  );
  protected readonly totali = new RemoteValue(
    () => this.repository.totali(this.menuId(), this.listinoId()),
    undefined,
  );
  /** Valori mostrati nei campi: ripartono da quelli del menù quando il menù viene ricaricato. */
  protected readonly pax = linkedSignal(() => this.menu().pax);
  protected readonly percRicetta = linkedSignal(() => this.menu().perc_ricetta);
  /** Spostamento in corso: il riordino resta bloccato finché il server non ha risposto. */
  protected readonly spostamento = signal(false);

  constructor() {
    toObservable(computed(() => [this.menuId(), this.listinoId()]))
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.righe.load();
        this.totali.load();
      });
  }

  protected async aggiungi(): Promise<void> {
    const scheda = await this.modals.open<RicettaCercata>(SearchModalComponent, {
      title: 'Aggiungi piatto',
      placeholder: 'Cerca una scheda tecnica',
      source: this.fonteSchede,
    });
    if (scheda) {
      // Nei menù evento la categoria è sempre 0.
      this.esegui(
        this.repository.addPiatto(this.menuId(), scheda.cod_p, 0),
        `«${scheda.nome_ric}» aggiunto al menù`,
        true,
      );
    }
  }

  protected aggiungiSeparatore(piatto: Piatto): void {
    this.esegui(this.repository.addSeparatore(this.menuId(), piatto.id));
  }

  protected async elimina(piatto: Piatto): Promise<void> {
    const conferma = await this.alerts.confirm(
      'Elimina piatto',
      `Confermi di eliminare «${piatto.descrizione}» dal menù?`,
      { confirmText: 'Elimina', cancelText: 'Annulla' },
    );
    if (conferma) {
      this.esegui(this.repository.deleteRiga(piatto.id), undefined, true);
    }
  }

  protected async eliminaSeparatore(separatore: Separatore): Promise<void> {
    const conferma = await this.alerts.confirm(
      'Elimina separatore',
      'Confermi di eliminare il separatore?',
      { confirmText: 'Elimina', cancelText: 'Annulla' },
    );
    if (conferma) {
      this.esegui(this.repository.deleteSeparatore(separatore.id));
    }
  }

  /**
   * Fine del trascinamento: l'elenco viene riordinato subito (complete con l'array lascia
   * il DOM ad Angular) e il server riceve la nuova posizione, da 1. Se rifiuta, si ricarica.
   */
  protected riordina(event: ReorderEndCustomEvent): void {
    const { from, to, complete } = event.detail;
    const spostata = this.righe.items()[from];
    // complete() riordina con splice l'array ricevuto: gli si passa una copia.
    const riordinate = complete([...this.righe.items()]) as RigaMenuEvento[];
    if (from === to || !spostata) {
      return;
    }
    this.righe.items.set(riordinate);
    this.spostamento.set(true);
    this.repository
      .moveRiga(this.menuId(), spostata.id, to + 1)
      .pipe(finalize(() => this.spostamento.set(false)))
      .subscribe({
        error: (error: unknown) => {
          this.toast.error(error);
          this.righe.load();
        },
      });
  }

  protected cambiaPax(event: InputCustomEvent): void {
    const pax = leggiNumero(event.detail.value);
    if (pax === undefined || (pax !== null && (!Number.isInteger(pax) || pax < 0))) {
      this.toast.error('Inserisci un numero di coperti intero, zero o maggiore.');
      ripristina(event, this.pax());
      return;
    }
    this.pax.set(pax);
    this.salvaCoperti();
  }

  protected cambiaPercRicetta(event: InputCustomEvent): void {
    const perc = leggiNumero(event.detail.value);
    if (perc === undefined || (perc !== null && (perc < 0 || perc > 100))) {
      this.toast.error('La percentuale deve essere compresa fra 0 e 100.');
      ripristina(event, this.percRicetta());
      return;
    }
    this.percRicetta.set(perc);
    this.salvaCoperti();
  }

  private salvaCoperti(): void {
    this.repository
      .updateCoperti(this.menuId(), this.pax(), this.percRicetta())
      .pipe(this.toast.notifyErrors())
      .subscribe(() => this.totali.load());
  }

  private esegui(operazione: Observable<void>, messaggio?: string, conTotali = false): void {
    operazione.pipe(this.toast.notifyErrors()).subscribe(() => {
      if (messaggio) {
        this.toast.success(messaggio);
      }
      this.righe.load();
      if (conTotali) {
        this.totali.load();
      }
    });
  }
}

/** Numero dal campo: `null` se vuoto, `undefined` se non è un numero. */
function leggiNumero(value: string | number | null | undefined): number | null | undefined {
  const testo = String(value ?? '')
    .trim()
    .replace(',', '.');
  if (!testo) {
    return null;
  }
  const numero = Number(testo);
  return Number.isFinite(numero) ? numero : undefined;
}

/** Rimette nel campo l'ultimo valore valido (il signal non è cambiato, Angular non lo farebbe). */
function ripristina(event: InputCustomEvent, value: number | null): void {
  event.target.value = value ?? '';
}
