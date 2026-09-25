import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonContent } from '@ionic/angular/ion-content';
import { IonFooter } from '@ionic/angular/ion-footer';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonInput } from '@ionic/angular/ion-input';
import { IonItem } from '@ionic/angular/ion-item';
import { IonList } from '@ionic/angular/ion-list';
import { IonModalToken } from '@ionic/angular/ion-modal-token';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';
import { IonTitle } from '@ionic/angular/ion-title';
import { IonToolbar } from '@ionic/angular/ion-toolbar';

import { Categoria } from '../../shared/models/categoria';
import { ListinoRiga, ListinoRigaModifica } from '../../shared/models/listino';

/** Modifica di una riga del listino; chiude con i valori da salvare e ruolo `confirm`. */
@Component({
  selector: 'ric-modal-edit-ingrediente-listino',
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
        <ion-title>{{ riga().descrizione }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="form" (ngSubmit)="salva()">
        <ion-list lines="full">
          <ion-item>
            <ion-input
              label="Nome"
              labelPlacement="stacked"
              formControlName="descrizione"
              [maxlength]="200"
              errorText="Il nome è obbligatorio"
            />
          </ion-item>
          <ion-item>
            <ion-input
              label="Scarto (%)"
              labelPlacement="stacked"
              type="number"
              inputmode="decimal"
              formControlName="scarto"
              [min]="0"
              [max]="100"
              errorText="Inserisci un valore tra 0 e 100"
            />
          </ion-item>
          <ion-item>
            <ion-input
              label="Peso (g)"
              labelPlacement="stacked"
              type="number"
              inputmode="decimal"
              formControlName="grammatura"
            />
          </ion-item>
          <ion-item>
            <ion-input
              label="Prezzo (€)"
              labelPlacement="stacked"
              type="number"
              inputmode="decimal"
              formControlName="prezzo"
            />
          </ion-item>
          <ion-item>
            <ion-input
              label="Calorie (kcal per 100 g)"
              labelPlacement="stacked"
              type="number"
              inputmode="decimal"
              formControlName="kcal"
            />
          </ion-item>
          <ion-item>
            <ion-select
              label="Categoria"
              labelPlacement="stacked"
              interface="popover"
              placeholder="Nessuna"
              formControlName="categoriaid"
            >
              @for (categoria of categorie(); track categoria.id) {
                <ion-select-option [value]="categoria.id">{{
                  categoria.descrizione
                }}</ion-select-option>
              }
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-input
              label="Provenienza"
              labelPlacement="stacked"
              formControlName="provenienza"
              [maxlength]="200"
            />
          </ion-item>
        </ion-list>
        <button type="submit" hidden></button>
      </form>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <ion-buttons slot="end">
          <ion-button (click)="annulla()">Annulla</ion-button>
          <ion-button [strong]="true" [disabled]="invalid()" (click)="salva()">Salva</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-footer>
  `,
})
export class ModalEditIngredienteListinoComponent implements OnInit {
  readonly riga = input.required<ListinoRiga>();
  readonly categorie = input<readonly Categoria[]>([]);

  private readonly modalEl = inject(IonModalToken);

  protected readonly form = inject(NonNullableFormBuilder).group({
    descrizione: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]],
    scarto: [null as number | null, [Validators.min(0), Validators.max(100)]],
    grammatura: [null as number | null],
    prezzo: [null as number | null],
    kcal: [null as number | null],
    categoriaid: [null as number | null],
    provenienza: ['', Validators.maxLength(200)],
  });
  private readonly status = toSignal(this.form.statusChanges, { initialValue: this.form.status });
  protected readonly invalid = computed(() => this.status() !== 'VALID');

  ngOnInit(): void {
    const riga = this.riga();
    this.form.reset({
      descrizione: riga.descrizione,
      scarto: riga.scarto,
      grammatura: riga.grammatura,
      prezzo: riga.prezzo,
      kcal: riga.kcal,
      categoriaid: riga.categoriaid,
      provenienza: riga.provenienza ?? '',
    });
  }

  protected salva(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const result: ListinoRigaModifica = {
      id: this.riga().id,
      descrizione: value.descrizione.trim(),
      scarto: toNumber(value.scarto),
      grammatura: toNumber(value.grammatura),
      prezzo: toNumber(value.prezzo),
      kcal: toNumber(value.kcal),
      categoriaid: value.categoriaid,
      provenienza: value.provenienza.trim() || null,
    };
    void this.modalEl.dismiss(result, 'confirm');
  }

  protected annulla(): void {
    void this.modalEl.dismiss(undefined, 'cancel');
  }
}

/** ion-input type=number restituisce numeri, stringa vuota o NaN. */
function toNumber(value: number | string | null): number | null {
  if (value === null || value === '') {
    return null;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
