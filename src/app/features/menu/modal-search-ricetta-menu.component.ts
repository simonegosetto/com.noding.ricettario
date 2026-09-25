import {Component, OnInit, ViewChild} from '@angular/core';
import {ModalService} from "../core/services/modal.service";
import {GlobalService} from "../core/services/global.service";
import {Ricetta} from "../shared/interface/ricetta";

@Component({
  selector: 'app-modal-search.ricetta',
  template: `
      <ion-header>
          <ion-toolbar>
              <ion-row>
                  <ion-col size="9">
                      <ion-searchbar #inputSearch
                                     placeholder="Cerca scheda tecnica"
                                     [(ngModel)]="ricerca.searchText"
                                     maxlength="50"
                                     (keydown.enter)="search()"></ion-searchbar>
                  </ion-col>
                  <ion-col size="3">
                      <ion-button class="button-block" style="margin-top: 12px" (click)="search()" >Cerca</ion-button>
                  </ion-col>
              </ion-row>
          </ion-toolbar>
      </ion-header>

      <ion-content padding>
          <ion-list>
              <ion-item *ngFor="let ricetta of ricerca.ricetteList" style="cursor: pointer" (click)="select(ricetta)">
                  <ion-label>{{ricetta.nome_ric}}</ion-label>
              </ion-item>
          </ion-list>
      </ion-content>

      <ion-footer>
          <ion-row>
              <ion-col><ion-button class="button-block" color="secondary" (click)="esci()">Chiudi</ion-button></ion-col>
          </ion-row>
      </ion-footer>
  `,
  styles: []
})
export class ModalSearchRicettaMenuComponent implements OnInit {

  constructor(
      public gs: GlobalService,
      public modal: ModalService
  ) { }


  //
  // Private
  //
    public ricerca = {
        searchText: undefined,
        ricetteList: [] as Ricetta[]
    };

    ngOnInit() {
    }

    search() {
        if (this.ricerca.searchText !== undefined && this.ricerca.searchText !== '' && this.ricerca.searchText.length > 2) {
            this.gs.callGateway('HxyjRLDEJny8J5KWQJxxH/N2DvGM7E+AAwfZYHDMArgtWy0tSVYtWy00+m4xbqqSUz0i0AekjSqtPiqiWRg1R4smKnwzWs6L9Q@@',
                '\'' + this.gs.isnull(this.ricerca.searchText) + '\'').subscribe(data => {
                    if (data.hasOwnProperty('error')) {
                        this.gs.toast.present(data.error);
                        return;
                    }
                    this.ricerca.ricetteList = data.recordset ? [...data.recordset]: [];
                    this.gs.loading.dismiss();
                },
                error => this.gs.toast.present(error.message, 5000)
            );
        }
    }

    select(ricetta: Ricetta) {
        this.modal.dismiss(ricetta);
    }

    esci() {
        this.modal.dismiss(undefined);
    }

}
