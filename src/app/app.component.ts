import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {GlobalService} from "./core/services/global.service";
import {Network} from "@ionic-native/network/ngx";
import {Router} from "@angular/router";

@Component({
  selector: 'ric-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  public appPages = [
    {
      title: 'Home',
      url: '/home',
      icon: 'home'
    },
    {
      title: 'Ricerca ricette',
      url: '/ricette',
      icon: 'document'
    },
    {
      title: 'Schede tecniche',
      url: '/schedetecniche',
      icon: 'clipboard'
    },
    {
      title: 'Archivio documenti',
      url: '/archiviodocumenti',
      icon: 'filing'
    },
    {
      title: 'Food cost',
      url: '/foodcost',
      icon: 'logo-euro'
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private network: Network,
    public gs: GlobalService,
    private _router: Router,
  ) {
    this.initializeApp();

    const sub = this.platform.backButton.subscribeWithPriority(9999, () => { });
    if (sub) {
      sub.unsubscribe();
    }
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      // @@@@@@@@@@@@@@@@@@@@@@@@@@@@ CHECK CONNESSIONE @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      this.gs.checkConnection();
      // watch network for a disconnection
      const disconnectSubscription = this.network.onDisconnect().subscribe(() => {
        this.gs.checkConnection();
      });
      // stop disconnect watch
      // disconnectSubscription.unsubscribe();
      // watch network for a connection
      const connectSubscription = this.network.onConnect().subscribe(() => {
        this.gs.checkConnection();
      });
      // stop connect watch
      // connectSubscription.unsubscribe();
      // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

      // controllo token
      if (localStorage.getItem('token') === undefined || localStorage.getItem('token') === null ) {
        this.gs.logged = false;
        this._router.navigate(['/login']);
      } else {
        this.gs.logged = true; // per evitare che la guard mi mandi al login in modo forzato
        this.gs.user = JSON.parse(localStorage.getItem('user'));
        this.gs.init();
      }
    });
  }

  doLogout() {
    if (this.gs.logout()) {
      this._router.navigate(['/login']);
    }
  }
}
