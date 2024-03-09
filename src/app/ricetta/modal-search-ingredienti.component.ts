import {Component, OnInit, ViewChild} from '@angular/core';
import {ModalService} from "../core/services/modal.service";
import {GlobalService} from "../core/services/global.service";
import {Ingrediente} from "../shared/interface/ingrediente";

@Component({
  selector: 'app-modal-search.ingredienti',
  template: `
      <ion-header>
          <ion-toolbar>
              <ion-row>
                  <ion-col size="9">
                      <ion-searchbar #inputSearch
                                     placeholder="Cerca ingredienti"
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
              <ion-item *ngFor="let ingrediente of ricerca.ricetteList | descrizione:ricerca.searchText" style="cursor: pointer" (click)="select(ingrediente)">
                  <ion-label>{{ingrediente.descrizione}}</ion-label>
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
export class ModalSearchIngredientiComponent implements OnInit {

  @ViewChild('inputSearch') inputSearchToForceFocus;

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

    ngOnInit() { }

    search() {
        if (this.ricerca.searchText !== undefined && this.ricerca.searchText !== '' && this.ricerca.searchText.length > 2) {
            this.gs.callGateway('92Z51ruEBMB16QsGuLCg5IRMITJbElTu04zeQyDQ8hwtWy0tSVYtWy3NfTOuxIemB4ik5YY3EihNRNShSM0huP/3RNSMWzBEiw@@','').subscribe(data => {
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

    select(ingrediente: Ingrediente) {
        this.modal.dismiss(ingrediente);
    }

    esci() {
        this.modal.dismiss(undefined);
    }

}
