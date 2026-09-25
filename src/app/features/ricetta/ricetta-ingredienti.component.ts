import { DecimalPipe } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChildren,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IonButton } from '@ionic/angular/ion-button';
import { IonCheckbox } from '@ionic/angular/ion-checkbox';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonInput } from '@ionic/angular/ion-input';
import { IonItem } from '@ionic/angular/ion-item';
import { IonList } from '@ionic/angular/ion-list';
import { IonReorder } from '@ionic/angular/ion-reorder';
import { IonReorderGroup } from '@ionic/angular/ion-reorder-group';
import { IonRouterLinkWithHref } from '@ionic/angular/ion-router-link';
import type { InputCustomEvent, ReorderEndCustomEvent } from '@ionic/angular';
import { finalize, Observable, switchMap } from 'rxjs';

import { AlertService } from '../../core/ui/alert.service';
import { ModalService } from '../../core/ui/modal.service';
import { ToastService } from '../../core/ui/toast.service';
import { RicetteRepository } from '../../data/ricette.repository';
import { Ingrediente } from '../../shared/models/ingrediente';
import { NuovaRicettaRiga, RicettaCercata, RicettaRiga } from '../../shared/models/ricetta';
import { SearchModalComponent } from '../../shared/search-modal/search-modal.component';
import { ingredientiRicettaSource, ricetteSource } from '../../shared/search-modal/search-sources';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { ListSkeletonComponent } from '../../shared/ui/list-skeleton.component';
import { RemoteList } from '../../shared/ui/remote-list';

/**
 * Righe della ricetta: ingredienti, sotto-ricette e righe libere, con quantità modificabile,
 * esclusione dal peso, riordino ed eliminazione. Emette `modificate` quando cambia qualcosa
 * che incide sul food cost o sulle sotto-ricette.
 */
@Component({
  selector: 'ric-ricetta-ingredienti',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    RouterLink,
    IonButton,
    IonCheckbox,
    IonIcon,
    IonInput,
    IonItem,
    IonList,
    IonReorder,
    IonReorderGroup,
    IonRouterLinkWithHref,
    EmptyStateComponent,
    ListSkeletonComponent,
  ],
  templateUrl: './ricetta-ingredienti.component.html',
  styleUrl: './ricetta-ingredienti.component.scss',
})
export class RicettaIngredientiComponent {
  private readonly repository = inject(RicetteRepository);
  private readonly modals = inject(ModalService);
  private readonly alerts = inject(AlertService);
  private readonly toast = inject(ToastService);
  private readonly injector = inject(Injector);

  private readonly fonteIngredienti = ingredientiRicettaSource();
  private readonly fonteRicette = ricetteSource();
  private readonly campiQuantita = viewChildren<IonInput>('quantita');

  readonly codP = input.required<number>();
  readonly modificate = output();

  protected readonly righe = new RemoteList(() => this.repository.righe(this.codP()));
  protected readonly spostamento = signal(false);
  protected readonly nuovaRiga = inject(NonNullableFormBuilder).group({
    nome: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]],
    quantita: [null as number | null, [Validators.min(0)]],
  });

  constructor() {
    toObservable(this.codP)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.righe.load());
  }

  protected async aggiungiIngrediente(): Promise<void> {
    const ingrediente = await this.modals.open<Ingrediente>(SearchModalComponent, {
      title: 'Aggiungi ingrediente',
      placeholder: 'Cerca un ingrediente',
      source: this.fonteIngredienti,
    });
    if (ingrediente) {
      this.inserisci({
        nome: ingrediente.descrizione,
        quantita: 1,
        ricettaid: 0,
        ingredienteid: ingrediente.id,
      });
    }
  }

  protected async aggiungiRicetta(): Promise<void> {
    const ricetta = await this.modals.open<RicettaCercata>(SearchModalComponent, {
      title: 'Aggiungi sotto-ricetta',
      placeholder: 'Cerca una ricetta',
      source: this.fonteRicette,
    });
    if (!ricetta) {
      return;
    }
    if (ricetta.cod_p === this.codP()) {
      // Il food cost si calcola ricorsivamente sulle sotto-ricette: non deve esserci un ciclo.
      this.toast.error('Una ricetta non può contenere se stessa.');
      return;
    }
    this.inserisci({
      nome: ricetta.nome_ric,
      quantita: 1,
      ricettaid: ricetta.cod_p,
      ingredienteid: 0,
    });
  }

  /** Riga libera (es. "Acqua", "Sale q.b."): senza ingrediente né ricetta collegati. */
  protected aggiungiLibera(): void {
    if (this.nuovaRiga.invalid) {
      this.nuovaRiga.markAllAsTouched();
      return;
    }
    const { nome, quantita } = this.nuovaRiga.getRawValue();
    this.inserisci({ nome: nome.trim(), quantita, ricettaid: 0, ingredienteid: 0 }, false);
    this.nuovaRiga.reset();
  }

  protected cambiaQuantita(riga: RicettaRiga, event: InputCustomEvent): void {
    const testo = String(event.detail.value ?? '')
      .trim()
      .replace(',', '.');
    const quantita = testo === '' ? null : Number(testo);
    if (quantita !== null && (!Number.isFinite(quantita) || quantita < 0)) {
      this.toast.error('Inserisci una quantità in grammi, zero o maggiore.');
      event.target.value = riga.quantita ?? '';
      return;
    }
    if (quantita !== riga.quantita) {
      this.aggiorna({ ...riga, quantita });
    }
  }

  protected cambiaEscludiPeso(riga: RicettaRiga, escludi: boolean): void {
    if (escludi !== riga.escludi_peso) {
      this.aggiorna({ ...riga, escludi_peso: escludi });
    }
  }

  protected async elimina(riga: RicettaRiga): Promise<void> {
    const conferma = await this.alerts.confirm(
      'Elimina riga',
      `Confermi di togliere «${riga.nome}» dalla ricetta?`,
      { confirmText: 'Elimina', cancelText: 'Annulla' },
    );
    if (conferma) {
      this.esegui(this.repository.deleteRiga(this.codP(), riga.id));
    }
  }

  /** Come nei menù evento: complete() su una copia, il DOM resta ad Angular. */
  protected riordina(event: ReorderEndCustomEvent): void {
    const { from, to, complete } = event.detail;
    const spostata = this.righe.items()[from];
    const riordinate = complete([...this.righe.items()]) as RicettaRiga[];
    if (from === to || !spostata) {
      return;
    }
    this.righe.items.set(riordinate);
    this.spostamento.set(true);
    this.repository
      .moveRiga(this.codP(), spostata.id, to + 1)
      .pipe(finalize(() => this.spostamento.set(false)))
      .subscribe({
        error: (error: unknown) => {
          this.toast.error(error);
          this.righe.load();
        },
      });
  }

  private aggiorna(riga: RicettaRiga): void {
    this.esegui(this.repository.updateRiga(this.codP(), riga));
  }

  /**
   * Inserisce la riga e ricarica l'elenco; con `focus` il cursore va sulla quantità della
   * riga nuova (le righe da ricerca partono da 1 g, come nella versione legacy).
   */
  private inserisci(riga: NuovaRicettaRiga, focus = true): void {
    const prima = new Set(this.righe.items().map((r) => r.id));
    this.repository
      .addRiga(this.codP(), riga)
      .pipe(
        switchMap(() => this.repository.righe(this.codP())),
        this.toast.notifyErrors(),
      )
      .subscribe((righe) => {
        this.righe.items.set(righe);
        this.righe.state.set('ready');
        this.modificate.emit();
        const nuova = righe.findIndex((r) => !prima.has(r.id));
        if (focus && nuova >= 0) {
          afterNextRender(() => void this.selezionaQuantita(nuova), { injector: this.injector });
        }
      });
  }

  /** Focus sulla quantità con il testo selezionato: si scrive subito il peso giusto. */
  private async selezionaQuantita(indice: number): Promise<void> {
    const campo = this.campiQuantita()[indice];
    if (campo) {
      await campo.setFocus();
      (await campo.getInputElement()).select();
    }
  }

  private esegui(operazione: Observable<void>): void {
    operazione.pipe(this.toast.notifyErrors()).subscribe(() => {
      this.righe.load();
      this.modificate.emit();
    });
  }
}
