import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonList } from '@ionic/angular/ion-list';
import { IonSkeletonText } from '@ionic/angular/ion-skeleton-text';

/** Segnaposto animato mostrato al primo caricamento di un elenco. */
@Component({
  selector: 'ric-list-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonItem, IonLabel, IonList, IonSkeletonText],
  template: `
    <ion-list class="app-list" aria-busy="true" aria-label="Caricamento">
      @for (row of rowsList(); track row) {
        <ion-item lines="full">
          <ion-label>
            <ion-skeleton-text [animated]="true" [style.width.%]="60 + (row % 3) * 12" />
            <ion-skeleton-text [animated]="true" [style.width.%]="30" />
          </ion-label>
        </ion-item>
      }
    </ion-list>
  `,
})
export class ListSkeletonComponent {
  readonly rows = input(6);
  protected readonly rowsList = computed(() => Array.from({ length: this.rows() }, (_, i) => i));
}
