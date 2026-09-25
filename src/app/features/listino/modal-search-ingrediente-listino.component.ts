import {Component, OnInit} from '@angular/core';
import {ModalService} from "../core/services/modal.service";
import {GlobalService} from "../core/services/global.service";
import {Ingrediente} from "../shared/interface/ingrediente";

@Component({
  selector: 'app-modal-search.ricetta',
  template: `
      <ion-header>
          <ion-toolbar>
              <ion-row>
                  <ion-col size="9">
                      <ion-searchbar #inputSearch
                                     placeholder="Cerca ingrediente"
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
              <ion-item *ngFor="let ingrediente of ricerca.ingredientiList" style="cursor: pointer" (click)="select(ingrediente)">
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
export class ModalSearchIngredienteListinoComponent implements OnInit {

  constructor(
      public gs: GlobalService,
      public modal: ModalService
  ) { }


  //
  // Private
  //
    public ricerca = {
        searchText: undefined,
        ingredientiList: [] as Ingrediente[]
    };

    ngOnInit() {

    }

    search() {
        if (this.ricerca.searchText !== undefined && this.ricerca.searchText !== '' && this.ricerca.searchText.length > 2) {
            this.gs.callGateway('dXBEtMkB3PLRn2LH7MgbpuJfe+O2GZXluu2mGitXWOAtWy0tSVYtWy2WminOAV2ecbjmo5i38HGB03aIxjfUYb5d82FkLu4EGg@@',
                '\'' + this.gs.isnull(this.ricerca.searchText) + '\'').subscribe(data => {
                    if (data.hasOwnProperty('error')) {
                        this.gs.toast.present(data.error);
                        return;
                    }
                    this.ricerca.ingredientiList = data.recordset ? [...data.recordset]: [];
                    this.gs.loading.dismiss();
                },
                error => this.gs.toast.present(error.message, 5000)
            );
        }
    }

    select(ingrediente: Ingrediente) {
        this.modal.dismiss(ingrediente.id);
    }

    esci() {
        this.modal.dismiss(undefined);
    }

}
