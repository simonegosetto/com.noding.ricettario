import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular/action-sheet-controller';
import { IonBackButton } from '@ionic/angular/ion-back-button';
import { IonBadge } from '@ionic/angular/ion-badge';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonContent } from '@ionic/angular/ion-content';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonList } from '@ionic/angular/ion-list';
import { IonRefresher } from '@ionic/angular/ion-refresher';
import { IonRefresherContent } from '@ionic/angular/ion-refresher-content';
import { IonSearchbar } from '@ionic/angular/ion-searchbar';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';
import { IonTitle } from '@ionic/angular/ion-title';
import { IonToolbar } from '@ionic/angular/ion-toolbar';
import type { ViewWillEnter } from '@ionic/angular';
import { Observable } from 'rxjs';

import { AlertService } from '../../core/ui/alert.service';
import { ModalService } from '../../core/ui/modal.service';
import { ToastService } from '../../core/ui/toast.service';
import { IngredientiRepository } from '../../data/ingredienti.repository';
import { ListiniRepository } from '../../data/listini.repository';
import { ListiniStore } from '../../data/listini.store';
import { ReportService } from '../../data/report.service';
import { Categoria } from '../../shared/models/categoria';
import { Ingrediente } from '../../shared/models/ingrediente';
import { CategoriaListino, ListinoRiga, ListinoRigaModifica } from '../../shared/models/listino';
import { Menu } from '../../shared/models/menu';
import { RicettaCercata } from '../../shared/models/ricetta';
import { SearchModalComponent } from '../../shared/search-modal/search-modal.component';
import {
  ingredientiListinoSource,
  menuSource,
  schedeTecnicheSource,
} from '../../shared/search-modal/search-sources';
import { filterByText } from '../../shared/text-filter';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { ListRowComponent } from '../../shared/ui/list-row.component';
import { ListSkeletonComponent } from '../../shared/ui/list-skeleton.component';
import { RemoteList } from '../../shared/ui/remote-list';
import { ModalEditIngredienteListinoComponent } from './modal-edit-ingrediente-listino.component';

type Aggiunta = 'ingrediente' | 'scheda' | 'menu';

@Component({
  selector: 'ric-listino',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    DecimalPipe,
    IonBackButton,
    IonBadge,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonList,
    IonRefresher,
    IonRefresherContent,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
    EmptyStateComponent,
    ListRowComponent,
    ListSkeletonComponent,
  ],
  templateUrl: './listino.page.html',
  styleUrl: './listino.page.scss',
})
export class ListinoPage implements ViewWillEnter {
  private readonly repository = inject(ListiniRepository);
  private readonly ingredienti = inject(IngredientiRepository);
  private readonly store = inject(ListiniStore);
  private readonly reports = inject(ReportService);
  private readonly router = inject(Router);
  private readonly modals = inject(ModalService);
  private readonly alerts = inject(AlertService);
  private readonly actionSheets = inject(ActionSheetController);
  private readonly toast = inject(ToastService);

  private readonly fonteIngredienti = ingredientiListinoSource();
  private readonly fonteSchede = schedeTecnicheSource();
  private readonly fonteMenu = menuSource();

  /** Parametro di rotta `:id`. */
  readonly id = input.required<string>();

  protected readonly filtri = CategoriaListino;
  protected readonly listinoId = computed(() => Number(this.id()));
  protected readonly titolo = computed(
    () => this.store.byId(this.listinoId())?.descrizione ?? 'Listino',
  );
  protected readonly categorie = signal<readonly Categoria[]>([]);
  protected readonly categoria = signal<number>(CategoriaListino.Tutte);
  protected readonly search = signal('');
  private readonly espanse = signal<ReadonlySet<number>>(new Set());

  protected readonly righe = new RemoteList(() =>
    this.repository.righe(this.listinoId(), this.categoria()),
  );
  protected readonly visibili = computed(() =>
    filterByText(this.righe.items(), this.search(), (riga) => riga.descrizione),
  );

  ionViewWillEnter(): void {
    if (!(this.listinoId() > 0)) {
      void this.router.navigate(['/listini'], { replaceUrl: true });
      return;
    }
    this.store.load().pipe(this.toast.notifyErrors()).subscribe();
    this.ingredienti
      .categorie()
      .pipe(this.toast.notifyErrors())
      .subscribe((categorie) => this.categorie.set(categorie));
    this.righe.load();
  }

  protected cambiaCategoria(value: unknown): void {
    this.categoria.set(Number(value));
    this.righe.load();
  }

  protected espansa(id: number): boolean {
    return this.espanse().has(id);
  }

  protected toggleInfo(id: number): void {
    this.espanse.update((espanse) => {
      const next = new Set(espanse);
      if (!next.delete(id)) {
        next.add(id);
      }
      return next;
    });
  }

  protected stampa(): void {
    this.reports.open(this.reports.listino(this.listinoId(), this.categoria()));
  }

  protected async aggiungi(): Promise<void> {
    const sheet = await this.actionSheets.create({
      header: 'Aggiungi al listino',
      buttons: [
        { text: 'Ingrediente', data: 'ingrediente' satisfies Aggiunta },
        { text: 'Scheda tecnica', data: 'scheda' satisfies Aggiunta },
        { text: 'Righe di un menù', data: 'menu' satisfies Aggiunta },
        { text: 'Annulla', role: 'cancel' },
      ],
    });
    await sheet.present();
    const { data } = await sheet.onDidDismiss<Aggiunta>();
    const listinoId = this.listinoId();
    if (data === 'ingrediente') {
      const ingrediente = await this.modals.open<Ingrediente>(SearchModalComponent, {
        title: 'Aggiungi ingrediente',
        placeholder: 'Cerca un ingrediente',
        source: this.fonteIngredienti,
      });
      if (ingrediente) {
        this.esegui(
          this.repository.addIngrediente(listinoId, ingrediente.id),
          'Ingrediente aggiunto',
        );
      }
    } else if (data === 'scheda') {
      const scheda = await this.modals.open<RicettaCercata>(SearchModalComponent, {
        title: 'Aggiungi scheda tecnica',
        placeholder: 'Cerca una scheda tecnica',
        source: this.fonteSchede,
      });
      if (scheda) {
        this.esegui(
          this.repository.addSchedaTecnica(listinoId, scheda.cod_p),
          'Scheda tecnica aggiunta',
        );
      }
    } else if (data === 'menu') {
      const menu = await this.modals.open<Menu>(SearchModalComponent, {
        title: 'Aggiungi le righe di un menù',
        placeholder: 'Cerca un menù',
        source: this.fonteMenu,
      });
      if (menu) {
        this.esegui(this.repository.addMenu(listinoId, menu.id), 'Righe del menù aggiunte');
      }
    }
  }

  protected async modifica(riga: ListinoRiga): Promise<void> {
    const modifica = await this.modals.open<ListinoRigaModifica>(
      ModalEditIngredienteListinoComponent,
      { riga, categorie: this.categorie() },
    );
    if (modifica) {
      this.esegui(this.repository.updateRiga(modifica), 'Ingrediente salvato');
    }
  }

  protected async elimina(riga: ListinoRiga): Promise<void> {
    const conferma = await this.alerts.confirm(
      'Elimina ingrediente',
      `Confermi di eliminare «${riga.descrizione}» dal listino?`,
      { confirmText: 'Elimina', cancelText: 'Annulla' },
    );
    if (conferma) {
      this.esegui(this.repository.deleteRiga(riga.id));
    }
  }

  private esegui(operazione: Observable<void>, messaggio?: string): void {
    operazione.pipe(this.toast.notifyErrors()).subscribe(() => {
      if (messaggio) {
        this.toast.success(messaggio);
      }
      this.righe.load();
    });
  }
}
