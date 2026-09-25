import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton } from '@ionic/angular/ion-button';
import { IonButtons } from '@ionic/angular/ion-buttons';
import { IonCard } from '@ionic/angular/ion-card';
import { IonCardContent } from '@ionic/angular/ion-card-content';
import { IonCardHeader } from '@ionic/angular/ion-card-header';
import { IonCardTitle } from '@ionic/angular/ion-card-title';
import { IonCol } from '@ionic/angular/ion-col';
import { IonContent } from '@ionic/angular/ion-content';
import { IonGrid } from '@ionic/angular/ion-grid';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonMenuButton } from '@ionic/angular/ion-menu-button';
import { IonRouterLink } from '@ionic/angular/ion-router-link';
import { IonRow } from '@ionic/angular/ion-row';
import { IonTextarea } from '@ionic/angular/ion-textarea';
import { IonTitle } from '@ionic/angular/ion-title';
import { IonToolbar } from '@ionic/angular/ion-toolbar';
import type { ViewWillEnter } from '@ionic/angular';

import { BusyService } from '../../core/ui/busy.service';
import { ToastService } from '../../core/ui/toast.service';
import { NoteRepository } from '../../data/note.repository';

interface Scorciatoia {
  label: string;
  icon: string;
  url: string;
  queryParams?: Record<string, number>;
}

@Component({
  selector: 'ric-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonMenuButton,
    IonRouterLink,
    IonRow,
    IonTextarea,
    IonTitle,
    IonToolbar,
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage implements ViewWillEnter {
  private readonly notes = inject(NoteRepository);
  private readonly toast = inject(ToastService);

  protected readonly busy = inject(BusyService).busy;
  protected readonly testo = signal('');
  protected readonly caricato = signal(false);

  protected readonly scorciatoie: readonly Scorciatoia[] = [
    { label: 'Nuova ricetta', icon: 'add-circle-outline', url: '/ricetta/0' },
    {
      label: 'Schede tecniche',
      icon: 'clipboard-outline',
      url: '/ricette',
      queryParams: { tipo: 2 },
    },
    { label: 'Menù', icon: 'restaurant-outline', url: '/menus' },
    { label: 'Listini prezzi', icon: 'list-outline', url: '/listini' },
  ];

  /** Le note sono condivise: si ricaricano a ogni ingresso nella pagina. */
  ionViewWillEnter(): void {
    this.notes
      .get()
      .pipe(this.toast.notifyErrors())
      .subscribe((testo) => {
        this.testo.set(testo);
        this.caricato.set(true);
      });
  }

  protected salva(): void {
    this.notes
      .save(this.testo())
      .pipe(this.toast.notifyErrors())
      .subscribe(() => this.toast.success('Note aggiornate'));
  }
}
