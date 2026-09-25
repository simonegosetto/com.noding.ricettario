import { inject, Injectable, Type } from '@angular/core';
import { ModalController } from '@ionic/angular/modal-controller';

type ModalOptions = Parameters<ModalController['create']>[0];

/**
 * Apertura dei modali. I `componentProps` arrivano ai signal `input()` del componente
 * (provideIonicAngular con useSetInputAPI): ogni chiave deve essere un input dichiarato.
 * Il modale chiude con `dismiss(valore, 'confirm')` o `dismiss(undefined, 'cancel')` (IonModalToken).
 */
@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly controller = inject(ModalController);

  /**
   * Risolve il valore confermato dal modale, `undefined` se è stato annullato. Aspetta la
   * chiusura completa: finché il modale è a video il suo focus trap riprenderebbe il focus
   * spostato dal chiamante, e un altro overlay aperto subito gli si sovrapporrebbe.
   */
  async open<R>(
    component: Type<unknown>,
    componentProps: Record<string, unknown> = {},
    options: Partial<Omit<ModalOptions, 'component' | 'componentProps'>> = {},
  ): Promise<R | undefined> {
    const modal = await this.controller.create({ ...options, component, componentProps });
    await modal.present();
    const { data, role } = await modal.onDidDismiss<R>();
    return role === 'confirm' ? data : undefined;
  }
}
