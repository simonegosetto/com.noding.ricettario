import {Component, OnInit, ViewChild} from '@angular/core';
import {ModalService} from "../core/services/modal.service";
import {GlobalService} from "../core/services/global.service";
import {Ricetta} from "../shared/interface/ricetta";
import {Menu} from "../shared/interface/menu";

@Component({
    selector: 'app-modal-search.ricetta',
    template: `
        <ion-header>
            <ion-toolbar>
                <ion-row>
                    <ion-col size="9">
                        <ion-searchbar #inputSearch
                                       placeholder="Cerca menù"
                                       [(ngModel)]="ricerca.searchText"
                                       maxlength="50"
                                       (keydown.enter)="search()"></ion-searchbar>
                    </ion-col>
                    <ion-col size="3">
                        <ion-button class="button-block" style="margin-top: 12px" (click)="search()">Cerca</ion-button>
                    </ion-col>
                </ion-row>
            </ion-toolbar>
        </ion-header>

        <ion-content padding>
            <ion-list>
                <ion-item *ngFor="let menu of ricerca.menuList | descrizione:ricerca.searchText" style="cursor: pointer"
                          (click)="select(menu)">
                    <ion-label>{{menu.descrizione}}</ion-label>
                </ion-item>
            </ion-list>
        </ion-content>

        <ion-footer>
            <ion-row>
                <ion-col>
                    <ion-button class="button-block" color="secondary" (click)="esci()">Chiudi</ion-button>
                </ion-col>
            </ion-row>
        </ion-footer>
    `,
    styles: []
})
export class ModalSearchMenuListinoComponent implements OnInit {

    constructor(
        public gs: GlobalService,
        public modal: ModalService
    ) {
    }


    //
    // Private
    //
    public ricerca = {
        searchText: '',
        menuList: [] as Menu[]
    };

    ngOnInit() {
        this.search();
    }

    search() {
        // if (this.ricerca.searchText !== undefined && this.ricerca.searchText !== '' && this.ricerca.searchText.length > 2) {
        this.gs.callGateway('okb5t42MzxMMO10EgkksbFQpXCzgQLrxVnqW8dDhrW0tWy0tSVYtWy2QU3GxVikgfK/sdvifCsRO5yJOE90sdeoUckFl95Ocfg@@', '').subscribe(data => {
                if (data.hasOwnProperty('error')) {
                    this.gs.toast.present(data.error);
                    return;
                }
                this.ricerca.menuList = data.recordset ? [...data.recordset] : [];
                this.gs.loading.dismiss();
            },
            error => this.gs.toast.present(error.message, 5000)
        );
        // }
    }

    select(menu: Menu) {
        this.modal.dismiss(menu.id);
    }

    esci() {
        this.modal.dismiss(undefined);
    }

}
