import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonContent } from '@ionic/angular/ion-content';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonList } from '@ionic/angular/ion-list';
import { IonMenuButton } from '@ionic/angular/ion-menu-button';
import { IonRefresher } from '@ionic/angular/ion-refresher';
import { IonRefresherContent } from '@ionic/angular/ion-refresher-content';
import { IonSearchbar } from '@ionic/angular/ion-searchbar';
import { IonSegment } from '@ionic/angular/ion-segment';
import { IonSegmentButton } from '@ionic/angular/ion-segment-button';
import { IonTitle } from '@ionic/angular/ion-title';
import { IonToolbar } from '@ionic/angular/ion-toolbar';
import type { ViewWillEnter } from '@ionic/angular';
import { skip } from 'rxjs';

import { AlertService } from '../../core/ui/alert.service';
import { ToastService } from '../../core/ui/toast.service';
import { ReportService } from '../../data/report.service';
import { RicetteRepository } from '../../data/ricette.repository';
import { RicettaListItem, TipoRicetta } from '../../shared/models/ricetta';
import { filterByText } from '../../shared/text-filter';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { ListRowComponent } from '../../shared/ui/list-row.component';
import { ListSkeletonComponent } from '../../shared/ui/list-skeleton.component';
import { RemoteList } from '../../shared/ui/remote-list';

@Component({
  selector: 'ric-ricette',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonLabel,
    IonList,
    IonMenuButton,
    IonRefresher,
    IonRefresherContent,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToolbar,
    EmptyStateComponent,
    ListRowComponent,
    ListSkeletonComponent,
  ],
  templateUrl: './ricette.page.html',
})
export class RicettePage implements ViewWillEnter {
  private readonly repository = inject(RicetteRepository);
  private readonly reports = inject(ReportService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly alerts = inject(AlertService);
  private readonly toast = inject(ToastService);

  /** Query param `?tipo=2` (es. dalla scorciatoia "Schede tecniche" della home). */
  readonly tipo = input<string>();

  protected readonly tipi = TipoRicetta;
  protected readonly tipoRicetta = computed<TipoRicetta>(() =>
    this.tipo() === String(TipoRicetta.SchedaTecnica)
      ? TipoRicetta.SchedaTecnica
      : TipoRicetta.Ricetta,
  );
  protected readonly ricette = new RemoteList(() => this.repository.list(this.tipoRicetta()));
  protected readonly search = signal('');
  protected readonly visibili = computed(() =>
    filterByText(this.ricette.items(), this.search(), (ricetta) => ricetta.nome_ric),
  );

  constructor() {
    // Il tipo sta nell'URL: cambiandolo la pagina resta la stessa e l'elenco si ricarica.
    toObservable(this.tipoRicetta)
      .pipe(skip(1), takeUntilDestroyed())
      .subscribe(() => this.ricette.load());
  }

  ionViewWillEnter(): void {
    this.ricette.load();
  }

  protected cambiaTipo(value: unknown): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tipo: Number(value) === TipoRicetta.SchedaTecnica ? 2 : null },
      replaceUrl: true,
    });
  }

  protected nuova(): void {
    void this.router.navigate(['/ricetta', 0]);
  }

  protected apri(ricetta: RicettaListItem): void {
    void this.router.navigate(['/ricetta', ricetta.cod_p]);
  }

  protected stampa(ricetta: RicettaListItem): void {
    this.reports.open(this.reports.ricetta(ricetta.cod_p, ricetta.composta));
  }

  protected async elimina(ricetta: RicettaListItem): Promise<void> {
    const conferma = await this.alerts.confirm(
      'Elimina ricetta',
      `Confermi di eliminare la ricetta «${ricetta.nome_ric}»?`,
      { confirmText: 'Elimina', cancelText: 'Annulla' },
    );
    if (conferma) {
      this.repository
        .delete(ricetta.cod_p)
        .pipe(this.toast.notifyErrors())
        .subscribe(() => this.ricette.load());
    }
  }
}
