import { Injectable } from '@angular/core';
import {AlertController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(public alertController: AlertController) { }

    async alert() {
        const alert = await this.alertController.create({
            header: 'Alert',
            subHeader: 'Subtitle',
            message: 'This is an alert message.',
            buttons: ['OK']
        });

        await alert.present();

        return alert.onDidDismiss();
    }

    async confirm(title, message) {
        const alert = await this.alertController.create({
            header: title,
            message: message,
            buttons: [
                {
                    text: 'NO',
                    role: 'KO',
                    cssClass: 'secondary',
                    handler: (blah) => { }
                }, {
                    text: 'SI',
                    role: 'OK',
                    handler: () => { }
                }
            ]
        });

        await alert.present();

        return alert.onDidDismiss();
    }

    dismiss(data) {
      this.alertController.dismiss(data);
    }
}
