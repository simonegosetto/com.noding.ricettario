import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  constructor(public modalController: ModalController) { }

    private _active = false;

    async present(page , params) {
        const modal = await this.modalController.create({
            component: page,
            componentProps: params
        });

        await modal.present().then(() => this._active = true);
        return modal.onDidDismiss();
    }

    public dismiss(data) {
        this.modalController.dismiss(data);
        this._active = false;
    }

    public isActive() {
        return this._active;
    }

    public dismissIfActive() {
        if (this._active) {
            this.dismiss(undefined);
        }
    }

}
