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
import { SchedeProduzioneRepository } from '../../data/schede-produzione.repository';
import {
  DescrizioneModalResult,
  ModalDescrizioneComponent,
} from '../../shared/modal-descrizione/modal-descrizione.component';
import { SchedaProduzione } from '../../shared/models/schede-produzione';
import { filterByText } from '../../shared/text-filter';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { ListRowComponent } from '../../shared/ui/list-row.component';
import { ListSkeletonComponent } from '../../shared/ui/list-skeleton.component';
import { RemoteList } from '../../shared/ui/remote-list';

@Component({
  selector: 'ric-schedeproduzione',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
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
  templateUrl: './schedeproduzione.page.html',
})
export class SchedeproduzionePage implements ViewWillEnter {
  private readonly repository = inject(SchedeProduzioneRepository);
  private readonly router = inject(Router);
  private readonly modals = inject(ModalService);
  private readonly alerts = inject(AlertService);
  private readonly toast = inject(ToastService);

  protected readonly schede = new RemoteList(() => this.repository.list());
  protected readonly search = signal('');
  protected readonly visibili = computed(() =>
    filterByText(this.schede.items(), this.search(), (scheda) => scheda.descrizione),
  );

  ionViewWillEnter(): void {
    this.schede.load();
  }

  protected apri(scheda: SchedaProduzione): void {
    void this.router.navigate(['/schedaproduzione', scheda.id]);
  }

  protected async nuova(): Promise<void> {
    const result = await this.modals.open<DescrizioneModalResult>(ModalDescrizioneComponent, {
      title: 'Nuova scheda di produzione',
    });
    if (result) {
      this.salva({ id: 0, descrizione: result.descrizione });
    }
  }

  protected async modifica(scheda: SchedaProduzione): Promise<void> {
    const result = await this.modals.open<DescrizioneModalResult>(ModalDescrizioneComponent, {
      title: 'Modifica scheda',
      descrizione: scheda.descrizione,
    });
    if (result) {
      this.salva({ id: scheda.id, descrizione: result.descrizione });
    }
  }

  protected async elimina(scheda: SchedaProduzione): Promise<void> {
    const conferma = await this.alerts.confirm(
      'Elimina scheda',
      `Confermi di eliminare la scheda «${scheda.descrizione}»?`,
      { confirmText: 'Elimina', cancelText: 'Annulla' },
    );
    if (conferma) {
      this.repository
        .delete(scheda.id)
        .pipe(this.toast.notifyErrors())
        .subscribe(() => this.schede.load());
    }
  }

  private salva(scheda: SchedaProduzione): void {
    this.repository
      .save(scheda)
      .pipe(this.toast.notifyErrors())
      .subscribe(() => {
        this.toast.success('Scheda salvata');
        this.schede.load();
      });
  }
}
