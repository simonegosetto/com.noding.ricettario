import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonContent } from '@ionic/angular/ion-content';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonInfiniteScroll } from '@ionic/angular/ion-infinite-scroll';
import { IonInfiniteScrollContent } from '@ionic/angular/ion-infinite-scroll-content';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonList } from '@ionic/angular/ion-list';
import { IonMenuButton } from '@ionic/angular/ion-menu-button';
import { IonRefresher } from '@ionic/angular/ion-refresher';
import { IonRefresherContent } from '@ionic/angular/ion-refresher-content';
import { IonSearchbar } from '@ionic/angular/ion-searchbar';
import { IonTitle } from '@ionic/angular/ion-title';
import { IonToolbar } from '@ionic/angular/ion-toolbar';
import type { ViewWillEnter } from '@ionic/angular';

import { DizionarioRepository } from '../../data/dizionario.repository';
import { filterByText } from '../../shared/text-filter';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { ListSkeletonComponent } from '../../shared/ui/list-skeleton.component';
import { completeIonTarget, RemoteList } from '../../shared/ui/remote-list';

/** Voci mostrate per volta: il dizionario è lungo e viene filtrato lato client. */
const PAGE_SIZE = 50;

/** Dizionario ingredienti (rotta /foodcost come nella versione legacy): valori nutrizionali. */
@Component({
  selector: 'ric-foodcost',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonItem,
    IonLabel,
    IonList,
    IonMenuButton,
    IonRefresher,
    IonRefresherContent,
    IonSearchbar,
    IonTitle,
    IonToolbar,
    EmptyStateComponent,
    ListSkeletonComponent,
  ],
  templateUrl: './foodcost.page.html',
  styleUrl: './foodcost.page.scss',
})
export class FoodcostPage implements ViewWillEnter {
  private readonly repository = inject(DizionarioRepository);
  private loadedOnce = false;

  protected readonly alimenti = new RemoteList(() => this.repository.alimenti());
  protected readonly search = signal('');
  private readonly limit = signal(PAGE_SIZE);

  private readonly filtrati = computed(() =>
    filterByText(this.alimenti.items(), this.search(), (alimento) => alimento.descrizione),
  );
  protected readonly visibili = computed(() => this.filtrati().slice(0, this.limit()));
  protected readonly altri = computed(() => this.filtrati().length > this.limit());

  /** Il dizionario cambia di rado: si carica al primo ingresso (e con il pull-to-refresh). */
  ionViewWillEnter(): void {
    if (!this.loadedOnce) {
      this.loadedOnce = true;
      this.alimenti.load();
    }
  }

  protected cerca(testo: string): void {
    this.search.set(testo);
    this.limit.set(PAGE_SIZE);
  }

  protected mostraAltri(event: Event): void {
    this.limit.update((limit) => limit + PAGE_SIZE);
    completeIonTarget(event);
  }
}
