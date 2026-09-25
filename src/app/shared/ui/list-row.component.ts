import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';

/**
 * Riga di elenco: l'area principale è cliccabile e le azioni (elementi con l'attributo
 * `actions`) le stanno accanto, non dentro, così non ci sono pulsanti annidati.
 */
@Component({
  selector: 'ric-list-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon, IonItem, IonLabel],
  template: `
    <ion-item
      class="list-row__main"
      lines="none"
      [button]="clickable()"
      [detail]="false"
      (click)="clickable() && open.emit()"
    >
      @if (icon(); as name) {
        <ion-icon slot="start" [name]="name" aria-hidden="true" />
      }
      <ion-label class="ion-text-wrap">
        <ng-content />
      </ion-label>
    </ion-item>
    <div class="list-row__actions">
      <ng-content select="[actions]" />
    </div>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      background: var(--ion-item-background);
      border-bottom: 1px solid var(--app-surface-border);
    }

    :host(:last-child) {
      border-bottom: none;
    }

    .list-row__main {
      flex: 1;
      min-width: 0;
      --background: transparent;
    }

    .list-row__actions {
      display: flex;
      align-items: center;
      padding-inline-end: 4px;
    }
  `,
})
export class ListRowComponent {
  readonly icon = input<string>();
  readonly clickable = input(true);
  readonly open = output();
}
