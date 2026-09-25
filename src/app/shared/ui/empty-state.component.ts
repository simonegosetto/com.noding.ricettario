import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IonIcon } from '@ionic/angular/ion-icon';

/** Messaggio per elenchi vuoti o in errore. */
@Component({
  selector: 'ric-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon],
  template: `
    <ion-icon [name]="icon()" aria-hidden="true" />
    <p>{{ message() }}</p>
    <ng-content />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 48px 16px;
      text-align: center;
      color: var(--app-muted-text);
    }

    ion-icon {
      font-size: 48px;
      opacity: 0.6;
    }

    p {
      margin: 0;
    }
  `,
})
export class EmptyStateComponent {
  readonly message = input.required<string>();
  readonly icon = input('information-circle-outline');
}
