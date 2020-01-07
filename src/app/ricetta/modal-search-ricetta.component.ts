import {Component, OnInit, ViewChild} from '@angular/core';
import {ModalService} from "../core/services/modal.service";
import {GlobalService} from "../core/services/global.service";

@Component({
  selector: 'app-modal-search.ricetta',
  template: `
      <ion-header>
          <ion-toolbar>
              <ion-row>
                  <ion-col size="9">
                      <ion-searchbar #inputSearch
                                     placeholder="Cerca ricetta"
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
          <ion-toolbar>
              <ion-row>
                  <ion-col><ion-button class="button-block" color="secondary" (click)="esci()">Exit</ion-button></ion-col>
              </ion-row>
          </ion-toolbar>
      </ion-footer>
  `,
  styles: []
})
export class ModalSearchRicettaComponent implements OnInit {

  @ViewChild('inputSearch', {static: false}) inputSearchToForceFocus;

  constructor(
      public gs: GlobalService,
      public modal: ModalService
  ) { }


  //
  // Private
  //
    public ricerca = {
        searchText: undefined,
        ricetteList: []
    };

    ngOnInit() {
        this.gs.focusInput(this.inputSearchToForceFocus);
    }

    search() {
        if (this.ricerca.searchText !== undefined && this.ricerca.searchText !== '' && this.ricerca.searchText.length > 2) {
            this.gs.callGateway('3kLcd3xP1l2BofsQVitE7aFZcbe/Xyf9fQwaS8Gl0DItWy0tSVYtWy0qziERz9x7zeayziwUIMl2Gbjz/C0hTBm6q/nRi8WZGQ@@',
                '\'' + this.gs.isnull(this.ricerca.searchText) + '\'').subscribe(data => {
                    if (data.hasOwnProperty('error')) {
                        this.gs.toast.present(data.error);
                        return;
                    }
                    this.ricerca.ricetteList = data.recordset ? [...data.recordset]: [];
                    this.gs.loading.dismiss();
                    // this.gs.focusInput(this.inputSearchToForceFocus);
                },
                error => this.gs.toast.present(error.message, 5000)
            );
        }
    }

    select(ricetta) {
        this.modal.dismiss(ricetta);
    }

    esci() {
        this.modal.dismiss(undefined);
    }

}
