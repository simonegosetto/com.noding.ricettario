import { inject, Injectable, Type } from '@angular/core';
import { ModalController } from '@ionic/angular';

type ModalOptions = Parameters<ModalController['create']>[0];

/**
 * Apertura dei modali. I `componentProps` arrivano ai signal `input()` del componente
 * (provideIonicAngular con useSetInputAPI): ogni chiave deve essere un input dichiarato.
 * Il modale chiude con `ModalController.dismiss(valore, 'confirm')` o `dismiss(undefined, 'cancel')`.
 */
@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly controller = inject(ModalController);

  /** Risolve il valore confermato dal modale, `undefined` se è stato annullato. */
  async open<R>(
    component: Type<unknown>,
    componentProps: Record<string, unknown> = {},
    options: Partial<Omit<ModalOptions, 'component' | 'componentProps'>> = {},
  ): Promise<R | undefined> {
    const modal = await this.controller.create({ ...options, component, componentProps });
    await modal.present();
    const { data, role } = await modal.onWillDismiss<R>();
    return role === 'confirm' ? data : undefined;
  }
}
