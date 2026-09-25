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
import { MenuRepository } from '../../data/menu.repository';
import {
  DescrizioneModalResult,
  ModalDescrizioneComponent,
} from '../../shared/modal-descrizione/modal-descrizione.component';
import { Menu, MenuSalvataggio, TipoMenu } from '../../shared/models/menu';
import { filterByText } from '../../shared/text-filter';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { ListRowComponent } from '../../shared/ui/list-row.component';
import { ListSkeletonComponent } from '../../shared/ui/list-skeleton.component';
import { RemoteList } from '../../shared/ui/remote-list';

@Component({
  selector: 'ric-menus',
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
  templateUrl: './menus.page.html',
})
export class MenusPage implements ViewWillEnter {
  private readonly repository = inject(MenuRepository);
  private readonly router = inject(Router);
  private readonly modals = inject(ModalService);
  private readonly alerts = inject(AlertService);
  private readonly toast = inject(ToastService);

  protected readonly tipi = TipoMenu;
  protected readonly menu = new RemoteList(() => this.repository.list());
  protected readonly search = signal('');
  protected readonly visibili = computed(() =>
    filterByText(this.menu.items(), this.search(), (menu) => menu.descrizione),
  );

  ionViewWillEnter(): void {
    this.menu.load();
  }

  protected apri(menu: Menu): void {
    void this.router.navigate(['/menu', menu.id]);
  }

  protected async nuovo(): Promise<void> {
    const result = await this.modals.open<DescrizioneModalResult>(ModalDescrizioneComponent, {
      title: 'Nuovo menù',
      tipo: TipoMenu.AllaCarta,
    });
    if (result) {
      this.salva({
        id: 0,
        descrizione: result.descrizione,
        tipo: result.tipo ?? TipoMenu.AllaCarta,
      });
    }
  }

  protected async modifica(menu: Menu): Promise<void> {
    const result = await this.modals.open<DescrizioneModalResult>(ModalDescrizioneComponent, {
      title: 'Modifica menù',
      descrizione: menu.descrizione,
      tipo: menu.tipo,
    });
    if (result) {
      this.salva({ id: menu.id, descrizione: result.descrizione, tipo: result.tipo ?? menu.tipo });
    }
  }

  protected async elimina(menu: Menu): Promise<void> {
    const conferma = await this.alerts.confirm(
      'Elimina menù',
      `Confermi di eliminare il menù «${menu.descrizione}»?`,
      { confirmText: 'Elimina', cancelText: 'Annulla' },
    );
    if (conferma) {
      this.repository
        .delete(menu.id)
        .pipe(this.toast.notifyErrors())
        .subscribe(() => this.menu.load());
    }
  }

  private salva(menu: MenuSalvataggio): void {
    this.repository
      .save(menu)
      .pipe(this.toast.notifyErrors())
      .subscribe(() => {
        this.toast.success('Menù salvato');
        this.menu.load();
      });
  }
}
