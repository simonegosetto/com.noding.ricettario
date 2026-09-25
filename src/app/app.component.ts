import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp } from '@ionic/angular/ion-app';
import { IonContent } from '@ionic/angular/ion-content';
import { IonFooter } from '@ionic/angular/ion-footer';
import { IonHeader } from '@ionic/angular/ion-header';
import { IonIcon } from '@ionic/angular/ion-icon';
import { IonItem } from '@ionic/angular/ion-item';
import { IonLabel } from '@ionic/angular/ion-label';
import { IonList } from '@ionic/angular/ion-list';
import { IonMenu } from '@ionic/angular/ion-menu';
import { IonMenuToggle } from '@ionic/angular/ion-menu-toggle';
import { IonNote } from '@ionic/angular/ion-note';
import { IonProgressBar } from '@ionic/angular/ion-progress-bar';
import { IonRouterLink } from '@ionic/angular/ion-router-link';
import { IonRouterOutlet } from '@ionic/angular/ion-router-outlet';
import { IonSplitPane } from '@ionic/angular/ion-split-pane';
import { IonTitle } from '@ionic/angular/ion-title';
import { IonToolbar } from '@ionic/angular/ion-toolbar';

import { READ_ONLY } from './core/api/read-only.interceptor';
import { AuthService } from './core/auth/auth.service';
import { OnlineStatusService } from './core/platform/online-status.service';
import { BusyService } from './core/ui/busy.service';

interface MenuPage {
  title: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'ric-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonMenu,
    IonMenuToggle,
    IonNote,
    IonProgressBar,
    IonRouterLink,
    IonRouterOutlet,
    IonSplitPane,
    IonTitle,
    IonToolbar,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly auth = inject(AuthService);

  protected readonly busy = inject(BusyService).busy;
  protected readonly online = inject(OnlineStatusService).online;
  protected readonly readOnly = inject(READ_ONLY);
  protected readonly loggedIn = this.auth.isLoggedIn;
  protected readonly userName = computed(() => {
    const user = this.auth.user();
    return [user?.nome, user?.cognome].filter(Boolean).join(' ') || 'Ricettario';
  });

  protected readonly pages: readonly MenuPage[] = [
    { title: 'Home', url: '/home', icon: 'home-outline' },
    { title: 'Ricette', url: '/ricette', icon: 'document-text-outline' },
    { title: 'Schede produzione', url: '/schedeproduzione', icon: 'clipboard-outline' },
    { title: 'Archivio documenti', url: '/archiviodocumenti', icon: 'file-tray-full-outline' },
    { title: 'Listini prezzi', url: '/listini', icon: 'list-outline' },
    { title: 'Menù', url: '/menus', icon: 'restaurant-outline' },
    { title: 'Dizionario ingredienti', url: '/foodcost', icon: 'book-outline' },
  ];

  protected logout(): void {
    this.auth.logout();
  }
}
