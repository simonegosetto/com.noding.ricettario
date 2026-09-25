import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { IonButton } from '@ionic/angular/ion-button';
import { IonCard } from '@ionic/angular/ion-card';
import { IonCardContent } from '@ionic/angular/ion-card-content';
import { IonCardHeader } from '@ionic/angular/ion-card-header';
import { IonCardTitle } from '@ionic/angular/ion-card-title';
import { IonRouterLinkWithHref } from '@ionic/angular/ion-router-link';
import { IonSkeletonText } from '@ionic/angular/ion-skeleton-text';
import { catchError, forkJoin, map, Observable, of, startWith, switchMap } from 'rxjs';

import { FileStorageRepository } from '../../data/file-storage.repository';
import { RicetteRepository } from '../../data/ricette.repository';
import { Ricetta, RicettaRiga } from '../models/ricetta';

type StatoCard =
  | { stato: 'loading' }
  | { stato: 'error' }
  | { stato: 'ready'; ricetta: Ricetta | undefined; righe: RicettaRiga[] };

/**
 * Ricetta in sola lettura (nome, ingredienti con quantità e percentuale, procedimento o
 * immagine a scelta): card delle schede di produzione e delle sotto-ricette. Testata e righe
 * arrivano con due chiamate in parallelo. Le azioni (attributo `actions`) vanno nell'intestazione.
 */
@Component({
  selector: 'ric-ricetta-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    RouterLink,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonRouterLinkWithHref,
    IonSkeletonText,
  ],
  template: `
    @let c = contenuto();
    <ion-card>
      <ion-card-header>
        <ion-card-title>
          @if (c.stato === 'ready') {
            <a class="card__titolo" [routerLink]="['/ricetta', codP()]">
              {{ c.ricetta?.nome_ric || 'Ricetta non trovata' }}
            </a>
          } @else if (c.stato === 'loading') {
            <ion-skeleton-text [animated]="true" class="card__titolo-skeleton" />
          } @else {
            Ricetta non disponibile
          }
        </ion-card-title>
        <div class="card__azioni">
          <ng-content select="[actions]" />
        </div>
      </ion-card-header>

      <ion-card-content>
        @switch (c.stato) {
          @case ('loading') {
            @for (riga of [1, 2, 3]; track riga) {
              <ion-skeleton-text [animated]="true" />
            }
          }
          @case ('error') {
            <p>Impossibile caricare la ricetta.</p>
            <ion-button fill="outline" size="small" (click)="riprova()">Riprova</ion-button>
          }
          @default {
            @if (immagine(); as src) {
              <img class="card__immagine" [src]="src" alt="" />
            }
            <div class="card__corpo" [class.card__corpo--affiancato]="procedimento()">
              <table class="card__ingredienti">
                <thead>
                  <tr>
                    <th scope="col">Ingrediente</th>
                    <th scope="col">Quantità</th>
                    <th scope="col">%</th>
                  </tr>
                </thead>
                <tbody>
                  @for (riga of righe(); track riga.id) {
                    <tr
                      [class.card__riga--esclusa]="riga.escludi_peso"
                      [attr.title]="riga.escludi_peso ? 'Escluso dal peso della ricetta' : null"
                    >
                      <td>{{ riga.nome }}</td>
                      <td class="app-num">
                        @if (riga.quantita !== null) {
                          {{ riga.quantita | number: '1.0-2' }} g
                        } @else {
                          —
                        }
                      </td>
                      <td class="app-num">
                        @if (riga.perc !== null) {
                          {{ riga.perc | number: '1.0-1' }}%
                        } @else {
                          —
                        }
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="3" class="app-muted">Nessun ingrediente.</td>
                    </tr>
                  }
                </tbody>
              </table>
              @if (procedimento(); as testo) {
                <section class="card__procedimento">
                  <h3>Procedimento</h3>
                  <p>{{ testo }}</p>
                </section>
              }
            </div>
          }
        }
      </ion-card-content>
    </ion-card>
  `,
  styleUrl: './ricetta-card.component.scss',
})
export class RicettaCardComponent {
  private readonly repository = inject(RicetteRepository);
  private readonly storage = inject(FileStorageRepository);

  readonly codP = input.required<number>();
  readonly mostraProcedimento = input(false);
  readonly mostraImmagine = input(false);

  private readonly tentativo = signal(0);
  private readonly richiesta = computed(() => ({ codP: this.codP(), tentativo: this.tentativo() }));

  protected readonly contenuto = toSignal(
    toObservable(this.richiesta).pipe(switchMap(({ codP }) => this.carica(codP))),
    { initialValue: { stato: 'loading' } as StatoCard },
  );
  protected readonly righe = computed(() => {
    const contenuto = this.contenuto();
    return contenuto.stato === 'ready' ? contenuto.righe : [];
  });
  protected readonly procedimento = computed(() => {
    const contenuto = this.contenuto();
    return this.mostraProcedimento() && contenuto.stato === 'ready'
      ? contenuto.ricetta?.procedimento?.trim() || null
      : null;
  });

  /** Link temporaneo Dropbox dell'immagine, chiesto dopo la testata e solo se serve. */
  private readonly percorsoImmagine = computed(() => {
    const contenuto = this.contenuto();
    return this.mostraImmagine() && contenuto.stato === 'ready'
      ? (contenuto.ricetta?.id_storage ?? null)
      : null;
  });
  protected readonly immagine = toSignal(
    toObservable(this.percorsoImmagine).pipe(
      switchMap((percorso) =>
        percorso ? this.storage.link(percorso).pipe(catchError(() => of(null))) : of(null),
      ),
    ),
    { initialValue: null },
  );

  protected riprova(): void {
    this.tentativo.update((n) => n + 1);
  }

  private carica(codP: number): Observable<StatoCard> {
    return forkJoin({
      ricetta: this.repository.get(codP),
      righe: this.repository.righe(codP),
    }).pipe(
      map(({ ricetta, righe }): StatoCard => ({ stato: 'ready', ricetta, righe })),
      // Errore mostrato nella card: con molte card un toast ciascuna sarebbe troppo.
      catchError(() => of<StatoCard>({ stato: 'error' })),
      startWith<StatoCard>({ stato: 'loading' }),
    );
  }
}
