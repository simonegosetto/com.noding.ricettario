import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { IonButton } from '@ionic/angular/ion-button';
import { IonInput } from '@ionic/angular/ion-input';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';
import type { InputCustomEvent } from '@ionic/angular';

import { ToastService } from '../../core/ui/toast.service';
import { ListiniStore } from '../../data/listini.store';
import { RicetteRepository } from '../../data/ricette.repository';
import { ListSkeletonComponent } from '../../shared/ui/list-skeleton.component';
import { RemoteList, RemoteValue } from '../../shared/ui/remote-list';

/**
 * Food cost della ricetta sul listino scelto (condiviso con le altre pagine): costo per
 * ingrediente, totali, peso effettivo e prezzo di vendita modificabili, indici calcolati dal DB.
 */
@Component({
  selector: 'ric-ricetta-foodcost',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    DecimalPipe,
    IonButton,
    IonInput,
    IonSelect,
    IonSelectOption,
    ListSkeletonComponent,
  ],
  templateUrl: './ricetta-foodcost.component.html',
  styleUrl: './ricetta-foodcost.component.scss',
})
export class RicettaFoodcostComponent {
  private readonly repository = inject(RicetteRepository);
  private readonly store = inject(ListiniStore);
  private readonly toast = inject(ToastService);

  readonly codP = input.required<number>();
  /** Cambia quando righe o testata sono state salvate: il food cost va ricalcolato. */
  readonly versione = input(0);
  readonly peso = output<number | null>();
  readonly prezzo = output<number | null>();

  protected readonly listini = this.store.listini;
  protected readonly listinoId = this.store.correnteId;
  protected readonly righe = new RemoteList(() =>
    this.repository.foodcost(this.codP(), this.listinoId() ?? 0),
  );
  protected readonly totali = new RemoteValue(
    () => this.repository.foodcostTotali(this.codP(), this.listinoId() ?? 0),
    undefined,
  );

  constructor() {
    // Una sola richiesta alla volta per righe e totali: cambi rapidi di listino non si accavallano.
    toObservable(computed(() => [this.codP(), this.listinoId(), this.versione()]))
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.righe.load();
        this.totali.load();
      });
  }

  protected cambiaListino(value: unknown): void {
    this.store.seleziona(Number(value));
  }

  protected cambiaPeso(event: InputCustomEvent): void {
    const peso = this.leggi(event, this.totali.value()?.peso_effettivo ?? null);
    if (peso !== undefined) {
      this.peso.emit(peso);
    }
  }

  protected cambiaPrezzo(event: InputCustomEvent): void {
    const prezzo = this.leggi(event, this.totali.value()?.prezzo_lordo_vendita ?? null);
    if (prezzo !== undefined) {
      this.prezzo.emit(prezzo);
    }
  }

  /** Numero ≥ 0 dal campo (`null` se vuoto); se non è valido ripristina il valore precedente. */
  private leggi(event: InputCustomEvent, precedente: number | null): number | null | undefined {
    const testo = String(event.detail.value ?? '')
      .trim()
      .replace(',', '.');
    const valore = testo === '' ? null : Number(testo);
    if (valore !== null && (!Number.isFinite(valore) || valore < 0)) {
      this.toast.error('Inserisci un valore numerico, zero o maggiore.');
      event.target.value = precedente ?? '';
      return undefined;
    }
    return valore === precedente ? undefined : valore;
  }
}
