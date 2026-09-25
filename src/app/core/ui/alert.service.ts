import { inject, Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

interface ConfirmOptions {
  confirmText?: string;
  cancelText?: string;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private readonly controller = inject(AlertController);

  /** Chiede conferma; risolve `true` solo se l'utente conferma. */
  async confirm(header: string, message: string, options: ConfirmOptions = {}): Promise<boolean> {
    const alert = await this.controller.create({
      header,
      message,
      buttons: [
        { text: options.cancelText ?? 'No', role: 'cancel' },
        { text: options.confirmText ?? 'Sì', role: 'confirm' },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role === 'confirm';
  }
}
