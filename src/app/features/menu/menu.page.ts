import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular/action-sheet-controller';
import { IonBackButton } from '@ionic/angular/ion-back-button';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonContent } from '@ionic/angular/ion-content';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';
import { IonTitle } from '@ionic/angular/ion-title';
import { IonToolbar } from '@ionic/angular/ion-toolbar';
import type { ViewWillEnter } from '@ionic/angular';
import { finalize } from 'rxjs';

import { ToastService } from '../../core/ui/toast.service';
import { ListiniStore } from '../../data/listini.store';
import { MenuRepository } from '../../data/menu.repository';
import { ReportService, VarianteStampaMenu } from '../../data/report.service';
import { TipoMenu } from '../../shared/models/menu';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { ListSkeletonComponent } from '../../shared/ui/list-skeleton.component';
import { RemoteValue } from '../../shared/ui/remote-list';
import { MenuAllaCartaComponent } from './menu-alla-carta.component';
import { MenuEventoComponent } from './menu-evento.component';

@Component({
  selector: 'ric-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
    EmptyStateComponent,
    ListSkeletonComponent,
    MenuAllaCartaComponent,
    MenuEventoComponent,
  ],
  templateUrl: './menu.page.html',
  styleUrl: './menu.page.scss',
})
export class MenuPage implements ViewWillEnter {
  private readonly repository = inject(MenuRepository);
  private readonly store = inject(ListiniStore);
  private readonly reports = inject(ReportService);
  private readonly router = inject(Router);
  private readonly actionSheets = inject(ActionSheetController);
  private readonly toast = inject(ToastService);

  /** Parametro di rotta `:id`. */
  readonly id = input.required<string>();

  protected readonly tipi = TipoMenu;
  protected readonly menuId = computed(() => Number(this.id()));
  protected readonly menu = new RemoteValue(() => this.repository.get(this.menuId()), undefined);
  protected readonly titolo = computed(() => this.menu.value()?.descrizione ?? 'Menù');
  protected readonly listini = this.store.listini;
  protected readonly listinoId = this.store.correnteId;
  /** Righe e totali aspettano i listini: senza, il food cost verrebbe calcolato due volte. */
  protected readonly listiniPronti = signal(false);

  ionViewWillEnter(): void {
    if (!(this.menuId() > 0)) {
      void this.router.navigate(['/menus'], { replaceUrl: true });
      return;
    }
    this.store
      .load()
      .pipe(
        this.toast.notifyErrors(),
        finalize(() => this.listiniPronti.set(true)),
      )
      .subscribe();
    this.menu.load();
  }

  protected cambiaListino(value: unknown): void {
    this.store.seleziona(Number(value));
  }

  protected async stampa(): Promise<void> {
    const menu = this.menu.value();
    if (!menu) {
      return;
    }
    if (menu.tipo === TipoMenu.AllaCarta) {
      this.apriStampa('standard');
      return;
    }
    // La finestra va aperta nel click: per questo si usa l'handler e non onDidDismiss.
    const sheet = await this.actionSheets.create({
      header: 'Stampa dell’evento',
      buttons: [
        // La stampa standard dell'evento è la lista della spesa (icona cestino nella legacy).
        { text: 'Lista della spesa', handler: () => this.apriStampa('standard') },
        { text: 'Con food cost', handler: () => this.apriStampa('foodcost') },
        { text: 'Distinta base (BOM)', handler: () => this.apriStampa('bom') },
        { text: 'Annulla', role: 'cancel' },
      ],
    });
    await sheet.present();
  }

  private apriStampa(variante: VarianteStampaMenu): void {
    const menu = this.menu.value();
    if (menu) {
      this.reports.open(this.reports.menu(menu, this.listinoId(), variante));
    }
  }
}
