import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonButton } from '@ionic/angular/ion-button';
import { IonContent } from '@ionic/angular/ion-content';
import { IonInput } from '@ionic/angular/ion-input';
import { IonInputPasswordToggle } from '@ionic/angular/ion-input-password-toggle';
import { IonItem } from '@ionic/angular/ion-item';
import { IonList } from '@ionic/angular/ion-list';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { OnlineStatusService } from '../../core/platform/online-status.service';
import { ToastService } from '../../core/ui/toast.service';

@Component({
  selector: 'ric-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgOptimizedImage,
    ReactiveFormsModule,
    IonButton,
    IonContent,
    IonInput,
    IonInputPasswordToggle,
    IonItem,
    IonList,
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly online = inject(OnlineStatusService).online;

  protected readonly sending = signal(false);
  protected readonly form = inject(NonNullableFormBuilder).group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  protected login(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.sending()) {
      return;
    }
    if (!this.online()) {
      void this.toast.show('Sei offline: controlla la connessione.', { color: 'warning' });
      return;
    }
    const { username, password } = this.form.getRawValue();
    this.sending.set(true);
    this.auth
      .login(username.trim(), password)
      .pipe(
        this.toast.notifyErrors(),
        finalize(() => this.sending.set(false)),
      )
      .subscribe(() => {
        this.form.reset();
        void this.router.navigateByUrl('/home', { replaceUrl: true });
      });
  }
}
