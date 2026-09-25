import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { IonButton } from '@ionic/angular/ion-button';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonItemDivider } from '@ionic/angular/ion-item-divider';
import { IonItemGroup } from '@ionic/angular/ion-item-group';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonList } from '@ionic/angular/ion-list';
import { IonSelect } from '@ionic/angular/ion-select';
import { IonSelectOption } from '@ionic/angular/ion-select-option';

import { AlertService } from '../../core/ui/alert.service';
import { ModalService } from '../../core/ui/modal.service';
import { ToastService } from '../../core/ui/toast.service';
import { MenuRepository } from '../../data/menu.repository';
import { Categoria } from '../../shared/models/categoria';
import { RigaMenuAllaCarta } from '../../shared/models/menu';
import { RicettaCercata } from '../../shared/models/ricetta';
import { SearchModalComponent } from '../../shared/search-modal/search-modal.component';
import { schedeTecnicheSource } from '../../shared/search-modal/search-sources';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';
import { ListRowComponent } from '../../shared/ui/list-row.component';
import { ListSkeletonComponent } from '../../shared/ui/list-skeleton.component';
import { RemoteList } from '../../shared/ui/remote-list';

type Piatto = Extract<RigaMenuAllaCarta, { kind: 'piatto' }>;

/** Categoria con i suoi piatti, nell'ordine restituito dal DB. */
interface SezioneMenu {
  id: number;
  categoria: string;
  piatti: Piatto[];
}

/** Menù alla carta: piatti raggruppati per categoria, con food cost e prezzo del listino. */
@Component({
  selector: 'ric-menu-alla-carta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CurrencyPipe,
    IonButton,
    IonIcon,
    IonItemDivider,
    IonItemGroup,
    IonLabel,
    IonList,
    IonSelect,
    IonSelectOption,
    EmptyStateComponent,
    ListRowComponent,
    ListSkeletonComponent,
  ],
  templateUrl: './menu-alla-carta.component.html',
  styleUrl: './menu-sezioni.scss',
})
export class MenuAllaCartaComponent {
  private readonly repository = inject(MenuRepository);
  private readonly router = inject(Router);
  private readonly modals = inject(ModalService);
  private readonly alerts = inject(AlertService);
  private readonly toast = inject(ToastService);

  private readonly fonteSchede = schedeTecnicheSource();

  readonly menuId = input.required<number>();
  readonly listinoId = input.required<number>();

  protected readonly categorie = signal<readonly Categoria[]>([]);
  /** Categoria dei piatti da aggiungere: resta scelta per aggiungerne altri. */
  protected readonly categoria = signal<number | null>(null);
  protected readonly righe = new RemoteList(() =>
    this.repository.righeAllaCarta(this.menuId(), this.listinoId()),
  );
  protected readonly sezioni = computed(() => raggruppa(this.righe.items()));

  constructor() {
    this.repository
      .categorie()
      .pipe(this.toast.notifyErrors(), takeUntilDestroyed())
      .subscribe((categorie) => this.categorie.set(categorie));
    // Primo caricamento e ricarica al cambio di listino (la richiesta precedente si annulla).
    toObservable(computed(() => [this.menuId(), this.listinoId()]))
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.righe.load());
  }

  protected cambiaCategoria(value: unknown): void {
    this.categoria.set(Number(value) || null);
  }

  protected apri(piatto: Piatto): void {
    void this.router.navigate(['/ricetta', piatto.ricettaid]);
  }

  protected async aggiungi(): Promise<void> {
    const categoria = this.categoria();
    if (!categoria) {
      return;
    }
    const scheda = await this.modals.open<RicettaCercata>(SearchModalComponent, {
      title: 'Aggiungi piatto',
      placeholder: 'Cerca una scheda tecnica',
      source: this.fonteSchede,
    });
    if (scheda) {
      this.repository
        .addPiatto(this.menuId(), scheda.cod_p, categoria)
        .pipe(this.toast.notifyErrors())
        .subscribe(() => {
          this.toast.success(`«${scheda.nome_ric}» aggiunto al menù`);
          this.righe.load();
        });
    }
  }

  protected async elimina(piatto: Piatto): Promise<void> {
    const conferma = await this.alerts.confirm(
      'Elimina piatto',
      `Confermi di eliminare «${piatto.descrizione}» dal menù?`,
      { confirmText: 'Elimina', cancelText: 'Annulla' },
    );
    if (conferma) {
      this.repository
        .deleteRiga(piatto.id)
        .pipe(this.toast.notifyErrors())
        .subscribe(() => this.righe.load());
    }
  }
}

/** Le intestazioni di categoria arrivano intercalate ai piatti: le si trasforma in gruppi. */
function raggruppa(righe: readonly RigaMenuAllaCarta[]): SezioneMenu[] {
  const sezioni: SezioneMenu[] = [];
  for (const riga of righe) {
    if (riga.kind === 'categoria') {
      sezioni.push({ id: riga.id, categoria: riga.categoria, piatti: [] });
    } else {
      if (!sezioni.length) {
        sezioni.push({ id: 0, categoria: 'Senza categoria', piatti: [] });
      }
      sezioni[sezioni.length - 1].piatti.push(riga);
    }
  }
  return sezioni;
}
