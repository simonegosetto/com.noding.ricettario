import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonBackButton } from '@ionic/angular/ion-back-button';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonContent } from '@ionic/angular/ion-content';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonRefresher } from '@ionic/angular/ion-refresher';
import { IonRefresherContent } from '@ionic/angular/ion-refresher-content';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';
import { IonTitle } from '@ionic/angular/ion-title';
import { IonToolbar } from '@ionic/angular/ion-toolbar';
import type { ViewWillEnter } from '@ionic/angular';
import { Observable } from 'rxjs';

import { AlertService } from '../../core/ui/alert.service';
import { ModalService } from '../../core/ui/modal.service';
import { ToastService } from '../../core/ui/toast.service';
import { ListiniStore } from '../../data/listini.store';
import { ReportService } from '../../data/report.service';
import { SchedeProduzioneRepository } from '../../data/schede-produzione.repository';
import { RicettaCercata } from '../../shared/models/ricetta';
import { SchedaProduzioneRiga } from '../../shared/models/schede-produzione';
import { RicettaCardComponent } from '../../shared/ricetta-card/ricetta-card.component';
import { SearchModalComponent } from '../../shared/search-modal/search-modal.component';
import { ricetteSource } from '../../shared/search-modal/search-sources';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { ListSkeletonComponent } from '../../shared/ui/list-skeleton.component';
import { RemoteList } from '../../shared/ui/remote-list';

@Component({
  selector: 'ric-schedaproduzione',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
    EmptyStateComponent,
    ListSkeletonComponent,
    RicettaCardComponent,
  ],
  templateUrl: './schedaproduzione.page.html',
  styleUrl: './schedaproduzione.page.scss',
})
export class SchedaproduzionePage implements ViewWillEnter {
  private readonly repository = inject(SchedeProduzioneRepository);
  private readonly store = inject(ListiniStore);
  private readonly reports = inject(ReportService);
  private readonly router = inject(Router);
  private readonly modals = inject(ModalService);
  private readonly alerts = inject(AlertService);
  private readonly toast = inject(ToastService);

  private readonly fonteRicette = ricetteSource();

  /** Parametro di rotta `:id`. */
  readonly id = input.required<string>();

  protected readonly schedaId = computed(() => Number(this.id()));
  /** Nome della scheda, letto dal backend (la versione legacy lo passava in sessionStorage). */
  protected readonly descrizione = signal<string | null>(null);
  protected readonly titolo = computed(() => this.descrizione() ?? 'Scheda di produzione');
  protected readonly listini = this.store.listini;
  protected readonly listinoId = this.store.correnteId;
  protected readonly righe = new RemoteList(() => this.repository.righe(this.schedaId()));

  ionViewWillEnter(): void {
    if (!(this.schedaId() > 0)) {
      void this.router.navigate(['/schedeproduzione'], { replaceUrl: true });
      return;
    }
    this.store.load().pipe(this.toast.notifyErrors()).subscribe();
    this.repository
      .get(this.schedaId())
      .pipe(this.toast.notifyErrors())
      .subscribe((scheda) => this.descrizione.set(scheda?.descrizione ?? null));
    this.righe.load();
  }

  protected cambiaListino(value: unknown): void {
    this.store.seleziona(Number(value));
  }

  /** Stampa delle schede tecniche di tutte le ricette, col food cost sul listino scelto. */
  protected stampa(conFoodcost: boolean): void {
    const ricette = this.righe.items().map((riga) => riga.ricettaid);
    if (ricette.length) {
      this.reports.open(
        this.reports.schedaTecnica(ricette, this.titolo(), conFoodcost, this.listinoId()),
      );
    }
  }

  protected async aggiungi(): Promise<void> {
    const ricetta = await this.modals.open<RicettaCercata>(SearchModalComponent, {
      title: 'Aggiungi ricetta',
      placeholder: 'Cerca una ricetta',
      source: this.fonteRicette,
    });
    if (ricetta) {
      this.esegui(
        this.repository.addRicetta(this.schedaId(), ricetta.cod_p),
        `«${ricetta.nome_ric}» aggiunta alla scheda`,
      );
    }
  }

  protected async togli(riga: SchedaProduzioneRiga): Promise<void> {
    const conferma = await this.alerts.confirm(
      'Togli ricetta',
      'Confermi di togliere la ricetta dalla scheda? La ricetta non viene eliminata.',
      { confirmText: 'Togli', cancelText: 'Annulla' },
    );
    if (conferma) {
      this.esegui(this.repository.deleteRiga(riga.id), 'Ricetta tolta dalla scheda');
    }
  }

  private esegui(operazione: Observable<void>, messaggio: string): void {
    operazione.pipe(this.toast.notifyErrors()).subscribe(() => {
      this.toast.success(messaggio);
      this.righe.load();
    });
  }
}
