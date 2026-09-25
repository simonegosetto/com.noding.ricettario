import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonContent } from '@ionic/angular/ion-content';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonList } from '@ionic/angular/ion-list';
import { IonMenuButton } from '@ionic/angular/ion-menu-button';
import { IonRefresher } from '@ionic/angular/ion-refresher';
import { IonRefresherContent } from '@ionic/angular/ion-refresher-content';
import { IonSearchbar } from '@ionic/angular/ion-searchbar';
import { IonTitle } from '@ionic/angular/ion-title';
import { IonToolbar } from '@ionic/angular/ion-toolbar';
import type { ViewWillEnter } from '@ionic/angular';

import { AlertService } from '../../core/ui/alert.service';
import { ModalService } from '../../core/ui/modal.service';
import { ToastService } from '../../core/ui/toast.service';
import { ListiniRepository } from '../../data/listini.repository';
import { ListiniStore } from '../../data/listini.store';
import {
  DescrizioneModalResult,
  ModalDescrizioneComponent,
} from '../../shared/modal-descrizione/modal-descrizione.component';
import { Listino } from '../../shared/models/listino';
import { filterByText } from '../../shared/text-filter';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { ListRowComponent } from '../../shared/ui/list-row.component';
import { ListSkeletonComponent } from '../../shared/ui/list-skeleton.component';
import { RemoteList } from '../../shared/ui/remote-list';

@Component({
  selector: 'ric-listini',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonList,
    IonMenuButton,
    IonRefresher,
    IonRefresherContent,
    IonSearchbar,
    IonTitle,
    IonToolbar,
    EmptyStateComponent,
    ListRowComponent,
    ListSkeletonComponent,
  ],
  templateUrl: './listini.page.html',
})
export class ListiniPage implements ViewWillEnter {
  private readonly repository = inject(ListiniRepository);
  private readonly store = inject(ListiniStore);
  private readonly router = inject(Router);
  private readonly modals = inject(ModalService);
  private readonly alerts = inject(AlertService);
  private readonly toast = inject(ToastService);

  protected readonly listini = new RemoteList(() => this.store.load(true));
  protected readonly search = signal('');
  protected readonly visibili = computed(() =>
    filterByText(this.listini.items(), this.search(), (listino) => listino.descrizione),
  );

  ionViewWillEnter(): void {
    this.listini.load();
  }

  protected apri(listino: Listino): void {
    void this.router.navigate(['/listino', listino.id]);
  }

  protected async nuovo(): Promise<void> {
    const result = await this.modals.open<DescrizioneModalResult>(ModalDescrizioneComponent, {
      title: 'Nuovo listino',
      aliquota: 0,
    });
    if (result) {
      this.salva({ id: 0, descrizione: result.descrizione, aliquota: result.aliquota ?? 0 });
    }
  }

  protected async modifica(listino: Listino): Promise<void> {
    const result = await this.modals.open<DescrizioneModalResult>(ModalDescrizioneComponent, {
      title: 'Modifica listino',
      descrizione: listino.descrizione,
      aliquota: listino.aliquota,
    });
    if (result) {
      this.salva({ ...listino, descrizione: result.descrizione, aliquota: result.aliquota ?? 0 });
    }
  }

  protected async elimina(listino: Listino): Promise<void> {
    const conferma = await this.alerts.confirm(
      'Elimina listino',
      `Confermi di eliminare il listino «${listino.descrizione}»?`,
      { confirmText: 'Elimina', cancelText: 'Annulla' },
    );
    if (conferma) {
      this.repository
        .delete(listino.id)
        .pipe(this.toast.notifyErrors())
        .subscribe(() => this.listini.load());
    }
  }

  private salva(listino: Listino): void {
    this.repository
      .save(listino)
      .pipe(this.toast.notifyErrors())
      .subscribe(() => {
        this.toast.success('Listino salvato');
        this.listini.load();
      });
  }
}
