import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonBackButton } from '@ionic/angular/ion-back-button';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonContent } from '@ionic/angular/ion-content';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonInput } from '@ionic/angular/ion-input';
import { IonTextarea } from '@ionic/angular/ion-textarea';
import { IonTitle } from '@ionic/angular/ion-title';
import { IonToolbar } from '@ionic/angular/ion-toolbar';
import { NavController } from '@ionic/angular/nav-controller';
import type { ViewWillEnter } from '@ionic/angular';
import { finalize, map, of, tap } from 'rxjs';

import { ConModificheNonSalvate } from '../../core/navigation/unsaved-changes.guard';
import { AlertService } from '../../core/ui/alert.service';
import { ToastService } from '../../core/ui/toast.service';
import { ListiniStore } from '../../data/listini.store';
import { ReportService } from '../../data/report.service';
import { RicetteRepository } from '../../data/ricette.repository';
import { Ricetta, RicettaSalvataggio } from '../../shared/models/ricetta';
import { RicettaCardComponent } from '../../shared/ricetta-card/ricetta-card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { ListSkeletonComponent } from '../../shared/ui/list-skeleton.component';
import { RemoteList, RemoteValue } from '../../shared/ui/remote-list';
import { RicettaFoodcostComponent } from './ricetta-foodcost.component';
import { RicettaImmagineComponent } from './ricetta-immagine.component';
import { RicettaIngredientiComponent } from './ricetta-ingredienti.component';

type ModificheVendita = Partial<Pick<RicettaSalvataggio, 'prezzo_vendita' | 'peso_effettivo'>>;

/**
 * Editor della ricetta (`/ricetta/0` per crearne una). Nome, procedimento, peso effettivo e
 * prezzo di vendita si salvano insieme (RICETTA_SAVE); righe, foto e food cost hanno i loro
 * componenti e si abilitano dopo il primo salvataggio.
 */
@Component({
  selector: 'ric-ricetta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonTextarea,
    IonTitle,
    IonToolbar,
    EmptyStateComponent,
    ListSkeletonComponent,
    RicettaCardComponent,
    RicettaFoodcostComponent,
    RicettaImmagineComponent,
    RicettaIngredientiComponent,
  ],
  templateUrl: './ricetta.page.html',
  styleUrl: './ricetta.page.scss',
  host: { '(window:beforeunload)': 'avvisaUscita($event)' },
})
export class RicettaPage implements ViewWillEnter, ConModificheNonSalvate {
  private readonly repository = inject(RicetteRepository);
  private readonly store = inject(ListiniStore);
  private readonly reports = inject(ReportService);
  private readonly navCtrl = inject(NavController);
  private readonly alerts = inject(AlertService);
  private readonly toast = inject(ToastService);

  /** Parametro di rotta `:id` (0 = nuova ricetta). */
  readonly id = input.required<string>();

  protected readonly codP = computed(() => {
    const id = Number(this.id());
    return Number.isInteger(id) && id > 0 ? id : 0;
  });
  protected readonly nuova = computed(() => this.codP() === 0);

  protected readonly form = inject(NonNullableFormBuilder).group({
    nome_ric: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]],
    procedimento: [''],
  });
  protected readonly modificata = toSignal(this.form.events.pipe(map(() => this.form.dirty)), {
    initialValue: false,
  });

  protected readonly testata = new RemoteValue<Ricetta | undefined>(
    () =>
      this.nuova()
        ? of(undefined)
        : this.repository.get(this.codP()).pipe(tap((ricetta) => this.allineaForm(ricetta))),
    undefined,
  );
  protected readonly sottoricette = new RemoteList(() =>
    this.nuova() ? of([]) : this.repository.sottoricette(this.codP()),
  );
  /** Una sotto-ricetta usata in due righe si mostra una volta sola. */
  protected readonly sottoricetteUniche = computed(() => [...new Set(this.sottoricette.items())]);
  /** Con sotto-ricette la stampa è il report HTML, che può includere il food cost. */
  protected readonly composta = computed(() => this.sottoricette.items().length > 0);
  protected readonly titolo = computed(() =>
    this.nuova() ? 'Nuova ricetta' : this.testata.value()?.nome_ric || 'Ricetta',
  );
  protected readonly listiniPronti = signal(false);
  /** Incrementata dopo ogni modifica che cambia il food cost: il pannello si ricarica. */
  protected readonly versione = signal(0);
  protected readonly salvataggio = signal(false);

  ionViewWillEnter(): void {
    this.testata.load();
    if (!this.nuova()) {
      this.sottoricette.load();
      this.store
        .load()
        .pipe(
          this.toast.notifyErrors(),
          finalize(() => this.listiniPronti.set(true)),
        )
        .subscribe();
    }
  }

  /** Salva la testata; dal pannello food cost arrivano peso effettivo o prezzo di vendita. */
  protected salva(modifiche: ModificheVendita = {}): void {
    if (!this.nuova() && !this.form.dirty && !Object.keys(modifiche).length) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Il nome della ricetta è obbligatorio.');
      return;
    }
    const corrente = this.testata.value();
    const { nome_ric, procedimento } = this.form.getRawValue();
    // Prezzo e peso non modificati restano quelli salvati (la versione legacy li sovrascriveva
    // con i valori letti all'apertura della pagina).
    const ricetta: RicettaSalvataggio = {
      cod_p: this.codP(),
      nome_ric: nome_ric.trim(),
      procedimento: procedimento.trim() ? procedimento : null,
      prezzo_vendita:
        'prezzo_vendita' in modifiche
          ? (modifiche.prezzo_vendita ?? null)
          : (corrente?.prezzo_vendita ?? null),
      peso_effettivo:
        'peso_effettivo' in modifiche
          ? (modifiche.peso_effettivo ?? null)
          : (corrente?.peso_effettivo ?? null),
    };
    this.salvataggio.set(true);
    this.repository
      .save(ricetta)
      .pipe(
        finalize(() => this.salvataggio.set(false)),
        this.toast.notifyErrors(),
      )
      .subscribe((codP) => {
        if (this.nuova()) {
          this.dopoCreazione(codP);
          return;
        }
        this.form.markAsPristine();
        this.testata.value.set({ ...ricetta, id_storage: corrente?.id_storage ?? null });
        this.versione.update((versione) => versione + 1);
        this.toast.success('Ricetta salvata');
      });
  }

  protected dopoModificaRighe(): void {
    this.versione.update((versione) => versione + 1);
    this.sottoricette.load();
  }

  protected stampa(conFoodcost: boolean): void {
    this.reports.open(
      this.reports.ricettaDettaglio(
        this.codP(),
        this.composta(),
        conFoodcost,
        this.store.correnteId(),
      ),
    );
  }

  puoUscire(): boolean | Promise<boolean> {
    if (!this.form.dirty) {
      return true;
    }
    return this.alerts.confirm(
      'Modifiche non salvate',
      'Il nome o il procedimento sono stati modificati e non salvati. Uscire comunque?',
      { confirmText: 'Esci senza salvare', cancelText: 'Resta' },
    );
  }

  /** Chiusura o ricarica della scheda del browser con modifiche in sospeso. */
  protected avvisaUscita(event: BeforeUnloadEvent): void {
    if (this.form.dirty) {
      event.preventDefault();
    }
  }

  private dopoCreazione(codP: number): void {
    if (!(codP > 0)) {
      this.toast.error('Il server non ha restituito l’id della nuova ricetta.');
      return;
    }
    this.form.markAsPristine();
    this.toast.success('Ricetta creata: ora puoi aggiungere ingredienti, foto e food cost');
    // Stessa pagina con l'id vero: /ricetta/0 non resta nella cronologia.
    void this.navCtrl.navigateForward(['/ricetta', codP], { replaceUrl: true, animated: false });
  }

  /** Al (ri)caricamento aggiorna il form, ma senza buttare modifiche non ancora salvate. */
  private allineaForm(ricetta: Ricetta | undefined): void {
    if (!this.form.dirty) {
      this.form.reset({
        nome_ric: ricetta?.nome_ric ?? '',
        procedimento: ricetta?.procedimento ?? '',
      });
    }
  }
}
