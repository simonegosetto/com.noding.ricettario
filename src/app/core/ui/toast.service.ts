import { inject, Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { catchError, EMPTY, MonoTypeOperatorFunction } from 'rxjs';

import { errorMessage } from '../api/gateway-error';

interface ToastOptions {
  duration?: number;
  color?: 'success' | 'danger' | 'warning' | 'medium';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly controller = inject(ToastController);

  async show(message: string, options: ToastOptions = {}): Promise<void> {
    const toast = await this.controller.create({
      message,
      duration: options.duration ?? 3000,
      color: options.color,
      position: 'bottom',
      swipeGesture: 'vertical',
    });
    await toast.present();
  }

  success(message: string): void {
    void this.show(message, { color: 'success' });
  }

  error(error: unknown): void {
    void this.show(errorMessage(error), { color: 'danger', duration: 5000 });
  }

  /** Operatore RxJS per le pagine: in caso di errore mostra il toast e completa senza emettere. */
  notifyErrors<T>(): MonoTypeOperatorFunction<T> {
    return catchError((error: unknown) => {
      this.error(error);
      return EMPTY;
    });
  }
}
