import { Injectable } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class PopoverService {

  constructor(public popoverController: PopoverController) { }

    private _active = false;

    async present(ev: any, component: any) {
        const popover = await this.popoverController.create({
            component: component,
            event: ev,
            translucent: true
        });

        await popover.present().then(() => this._active = true);

        return popover.onDidDismiss();
    }

    public dismiss(data) {
      this.popoverController.dismiss(data);
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

