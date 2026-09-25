import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonModalToken,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

import { TipoMenu } from '../models/menu';

/** Valori confermati: `aliquota` e `tipo` ci sono solo se il modale li ha richiesti. */
export interface DescrizioneModalResult {
  descrizione: string;
  aliquota?: number;
  tipo?: TipoMenu;
}

/**
 * Modale per creare o rinominare listini, menù, schede e cartelle. Il campo Nome c'è sempre;
 * Aliquota IVA e Tipo compaiono passando il relativo valore iniziale.
 */
@Component({
  selector: 'ric-modal-descrizione',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    IonButton,
    IonButtons,
    IonContent,
    IonFooter,
    IonHeader,
    IonInput,
    IonItem,
    IonList,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ title() }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="form" (ngSubmit)="conferma()">
        <ion-list lines="full">
          <ion-item>
            <ion-input
              label="Nome"
              labelPlacement="stacked"
              formControlName="descrizione"
              [maxlength]="200"
              [clearInput]="true"
              errorText="Il nome è obbligatorio"
            />
          </ion-item>
          @if (aliquota() !== undefined) {
            <ion-item>
              <ion-input
                label="Aliquota IVA (%)"
                labelPlacement="stacked"
                type="number"
                inputmode="decimal"
                formControlName="aliquota"
                [min]="0"
                [max]="100"
                errorText="Inserisci un valore tra 0 e 100"
              />
            </ion-item>
          }
          @if (tipo() !== undefined) {
            <ion-item>
              <ion-select
                label="Tipo"
                labelPlacement="stacked"
                interface="popover"
                formControlName="tipo"
              >
                <ion-select-option [value]="tipiMenu.AllaCarta">Alla carta</ion-select-option>
                <ion-select-option [value]="tipiMenu.Evento">Evento</ion-select-option>
              </ion-select>
            </ion-item>
          }
        </ion-list>
        <!-- Invio da tastiera -->
        <button type="submit" hidden></button>
      </form>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="end">
          <ion-button (click)="annulla()">{{ cancelText() }}</ion-button>
          <ion-button [strong]="true" [disabled]="invalid()" (click)="conferma()">
            {{ confirmText() }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
})
export class ModalDescrizioneComponent implements OnInit {
  readonly title = input.required<string>();
  readonly confirmText = input('Salva');
  readonly cancelText = input('Annulla');
  readonly descrizione = input('');
  /** Valorizzata = mostra il campo aliquota IVA (listini). */
  readonly aliquota = input<number | undefined>(undefined);
  /** Valorizzato = mostra la scelta del tipo di menù. */
  readonly tipo = input<TipoMenu | undefined>(undefined);

  // Non chiamarlo "modal": Ionic riserva quel nome di proprietà.
  private readonly modalEl = inject(IonModalToken);

  protected readonly tipiMenu = TipoMenu;
  protected readonly form = inject(NonNullableFormBuilder).group({
    descrizione: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]],
    aliquota: [0 as number | null, [Validators.min(0), Validators.max(100)]],
    tipo: [TipoMenu.AllaCarta as TipoMenu],
  });
  private readonly status = toSignal(this.form.statusChanges, { initialValue: this.form.status });
  protected readonly invalid = computed(() => this.status() !== 'VALID');

  ngOnInit(): void {
    this.form.reset({
      descrizione: this.descrizione(),
      aliquota: this.aliquota() ?? 0,
      tipo: this.tipo() ?? TipoMenu.AllaCarta,
    });
  }

  protected conferma(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { descrizione, aliquota, tipo } = this.form.getRawValue();
    const result: DescrizioneModalResult = { descrizione: descrizione.trim() };
    if (this.aliquota() !== undefined) {
      result.aliquota = Number(aliquota ?? 0);
    }
    if (this.tipo() !== undefined) {
      result.tipo = tipo;
    }
    void this.modalEl.dismiss(result, 'confirm');
  }

  protected annulla(): void {
    void this.modalEl.dismiss(undefined, 'cancel');
  }
}
