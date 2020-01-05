import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(public toast: ToastController) { }

  async present(message: string, duration: number = 3000) {
      const toast = await this.toast.create({
          message: message,
          duration: duration
      });
      toast.present();
  }
}
