import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonContent } from '@ionic/angular/ion-content';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonList } from '@ionic/angular/ion-list';
import { IonModalToken } from '@ionic/angular/ion-modal-token';
import { IonProgressBar } from '@ionic/angular/ion-progress-bar';
import { IonSearchbar } from '@ionic/angular/ion-searchbar';
import { IonTitle } from '@ionic/angular/ion-title';
import { IonToolbar } from '@ionic/angular/ion-toolbar';
import { distinctUntilChanged, finalize, of, switchMap } from 'rxjs';

import { ToastService } from '../../core/ui/toast.service';
import { filterByText } from '../text-filter';
import { SearchSource } from './search-source';

/**
 * Modale di ricerca generico: sostituisce i 7 modali legacy (ricette, schede tecniche,
 * ingredienti, menù, cartelle...). Chiude con l'elemento scelto e ruolo `confirm`.
 */
@Component({
  selector: 'ric-search-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonProgressBar,
    IonSearchbar,
    IonTitle,
    IonToolbar,
  ],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ title() }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="chiudi()">Chiudi</ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar
          [placeholder]="placeholder()"
          [debounce]="300"
          [value]="query()"
          (ionInput)="query.set($event.detail.value ?? '')"
        />
      </ion-toolbar>
      @if (loading()) {
        <ion-progress-bar type="indeterminate" />
      }
    </ion-header>

    <ion-content>
      @if (hint(); as message) {
        <p class="search-modal__hint ion-padding ion-text-center">{{ message }}</p>
      } @else {
        <ion-list lines="full">
          @for (item of visible(); track source().key(item)) {
            <ion-item button [detail]="false" (click)="scegli(item)">
              <ion-label>{{ source().label(item) }}</ion-label>
            </ion-item>
          }
        </ion-list>
      }
    </ion-content>
  `,
  styles: `
    .search-modal__hint {
      color: var(--ion-color-medium);
    }
  `,
})
export class SearchModalComponent<T> implements OnInit {
  readonly title = input.required<string>();
  readonly placeholder = input('Cerca');
  readonly source = input.required<SearchSource<T>>();

  private readonly modalEl = inject(IonModalToken);
  private readonly toast = inject(ToastService);
  private readonly searchbar = viewChild(IonSearchbar);

  protected readonly query = signal('');
  protected readonly loading = signal(false);
  private readonly searched = signal(false);
  /** Risultati dal server (modalità server) o elenco completo (modalità client). */
  private readonly items = signal<readonly T[]>([]);
  private readonly text = computed(() => this.query().trim());

  protected readonly visible = computed(() => {
    const source = this.source();
    if (source.mode === 'server') {
      return this.items();
    }
    return this.text().length >= source.minChars
      ? filterByText(this.items(), this.text(), source.label)
      : [];
  });

  protected readonly hint = computed(() => {
    const min = this.source().minChars;
    if (this.text().length < min) {
      return `Scrivi almeno ${min} caratteri`;
    }
    if (!this.loading() && this.searched() && this.visible().length === 0) {
      return 'Nessun risultato';
    }
    return null;
  });

  constructor() {
    // Modalità server: una ricerca per ogni testo valido, annullando quella precedente.
    toObservable(this.text)
      .pipe(
        distinctUntilChanged(),
        switchMap((text) => {
          const source = this.source();
          if (source.mode !== 'server') {
            return of(null);
          }
          if (text.length < source.minChars) {
            return of([] as readonly T[]);
          }
          this.loading.set(true);
          return source.load(text).pipe(
            this.toast.notifyErrors(),
            finalize(() => this.loading.set(false)),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((items) => {
        if (items !== null) {
          this.items.set(items);
          this.searched.set(this.text().length >= this.source().minChars);
        }
      });

    this.modalEl.addEventListener('ionModalDidPresent', () => void this.searchbar()?.setFocus(), {
      once: true,
    });
  }

  ngOnInit(): void {
    // Modalità client: elenco caricato una volta sola all'apertura.
    const source = this.source();
    if (source.mode === 'client') {
      this.loading.set(true);
      source
        .load('')
        .pipe(
          this.toast.notifyErrors(),
          finalize(() => {
            this.loading.set(false);
            this.searched.set(true);
          }),
        )
        .subscribe((items) => this.items.set(items));
    }
  }

  protected scegli(item: T): void {
    void this.modalEl.dismiss(item, 'confirm');
  }

  protected chiudi(): void {
    void this.modalEl.dismiss(undefined, 'cancel');
  }
}
