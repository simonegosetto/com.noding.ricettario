import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {ModalService} from "../core/services/modal.service";
import {GlobalService} from "../core/services/global.service";
import {ArchivioFolder} from "../shared/interface/archivio-file";

@Component({
    selector: 'app-modal-archivio-folder.ricetta',
    template: `
        <ion-header>
            <ion-toolbar>
                <ion-row>
                    <ion-col size="9">
                        <ion-searchbar #inputSearch
                                       placeholder="Cerca cartella"
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
                <ion-item *ngFor="let folder of ricerca.folderList | descrizione:ricerca.searchText" style="cursor: pointer" (click)="select(folder)">
                    <small>{{folder.descrizione}}</small>
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
export class ModalArchivioFolderComponent implements AfterViewInit {

    @ViewChild('inputSearch') inputSearchToForceFocus;

    constructor(
        public gs: GlobalService,
        public modal: ModalService
    ) { }


    //
    // Private
    //
    public ricerca = {
        searchText: '',
        folderList: [] as ArchivioFolder[]
    };

    ngAfterViewInit() {
        setTimeout(() => {
            this.search();
        }, 0);
    }

    search() {
        this.gs.callGateway('Ayl+LWaNzmB0jK5bAt7dDw2s3Y1r3R3eas1IvS+HvCwtWy0tSVYtWy01yGI+Hwdj8Xd6HsSTttvNfEiaHHnOlhVgEphfAue/5g@@', '').subscribe(data => {
                if (data.hasOwnProperty('error')) {
                    this.gs.toast.present(data.error);
                    return;
                }
                this.ricerca.folderList = data.recordset ? [...data.recordset] : [];
                this.gs.loading.dismiss();
            },
            error => this.gs.toast.present(error.message, 5000)
        );
    }

    select(folder) {
        this.modal.dismiss(folder);
    }

    esci() {
        this.modal.dismiss(undefined);
    }

}
