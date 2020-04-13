import {AfterViewInit, Component} from '@angular/core';
import {NavParams} from '@ionic/angular';
import {ModalService} from "../../core/services/modal.service";
import {ModalConfig} from "../../core/interfaces/modal-config";

@Component({
    selector: 'app-modal-descrizione',
    template: `
        <ion-header>
            <ion-toolbar>
                <ion-title class="ion-text-center">{{modalConfig?.title}}</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <ion-item>
                <ion-label position="fixed">Nome</ion-label>
                <ion-input type="text" *ngIf="modalConfig?.data" [(ngModel)]="modalConfig.data.descrizione" required ></ion-input>
            </ion-item>
        </ion-content>

        <ion-footer>
            <ion-row>
                <ion-col *ngIf="modalConfig?.cancelText">
                    <ion-button class="button-block" color="secondary" (click)="esci()">{{modalConfig?.cancelText}}</ion-button>
                </ion-col>
                <ion-col *ngIf="modalConfig?.confirmText">
                    <ion-button class="button-block" (click)="conferma()">{{modalConfig?.confirmText}}</ion-button>
                </ion-col>
            </ion-row>
        </ion-footer>
    `,
    styles: []
})
export class ModalDescrizioneComponent implements AfterViewInit {

    constructor(
        public modal: ModalService,
        private _params: NavParams,
    ) {
    }

    //
    // Public
    //
    public modalConfig: ModalConfig;

    ngAfterViewInit() {
        this.modalConfig = {...this._params.data} as ModalConfig;
    }

    conferma() {
        this.modal.dismiss({...this.modalConfig.data})
    }

    esci() {
        this.modal.dismiss(undefined);
    }

}
