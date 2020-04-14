import {AfterViewInit, Component} from '@angular/core';
import {ModalService} from "../core/services/modal.service";
import {GlobalService} from "../core/services/global.service";
import {DropboxService} from "../core/services/dropbox.service";
import {NavParams} from "@ionic/angular";

@Component({
  selector: 'app-modal-carica-file',
  template: `
      <ion-header>
          <ion-toolbar>
            <ion-title class="ion-text-center">Caricamento file</ion-title>
          </ion-toolbar>
      </ion-header>

      <ion-content>
          <ion-row  class="ion-text-center">
              <ion-col class="ion-text-center">
                  <label class="fileUpload button button-positive button-small" >
                      <ion-input id="myFile" type="file" [(ngModel)]="file.base64" (change)="acquisisciFile($event)"></ion-input>
                  </label>
              </ion-col>
          </ion-row>
          
      </ion-content>

      <ion-footer>
          <ion-row>
              <ion-col><ion-button class="button-block" color="secondary" (click)="esci()">Chiudi</ion-button></ion-col>
              <ion-col><ion-button class="button-block" (click)="carica()" [disabled]="file.file === undefined">Carica file</ion-button></ion-col>
          </ion-row>
      </ion-footer>
  `,
  styles: []
})
export class ModalCaricaFileComponent implements AfterViewInit {

  constructor(
      public gs: GlobalService,
      public modal: ModalService,
      private _ds: DropboxService,
      private _params: NavParams,
  ) { }


  //
  // Private
  //
    public file = {
        base64: undefined,
        file: undefined,
        folderid: undefined
    };

    ngAfterViewInit() {
        if (this._params.data.hasOwnProperty('folderid')) {
            this.file.folderid = this._params.data.folderid;
        } else {
            this.esci();
        }
    }

    acquisisciFile(event) {
        this.file.file = event.target.files[0];
        /*if (this.ricetta.file.size > 1000000) {
            this.gs.toast.present('L\'immagine non può superare 1 MB di peso !');
            return;
        }*/
    }

    carica() {
        if (this.file.file) {
            const reader = new FileReader();
            reader.onload = this._handleReaderLoaded.bind(this);
            reader.readAsBinaryString(this.file.file);
        }
    }

    private _handleReaderLoaded(readerEvt) {
        const binaryString = readerEvt.target.result;
        this.file.base64 = btoa(binaryString);

        this.gs.callGateway('aQWu1SmmaITFs0wPPtAi4mvH+ZEphShyYYeUM98pg4ItWy0tSVYtWy1e+2qzPC9u9O9elSJdaZHz9f7O3jqBQcRNBlkfcApwog@@',
            `'${this.file.file.name}','${this.file.file.name}',${this.file.folderid},${this.file.file.size},'${this.file.file.type}',@out_id`).subscribe(data => {
                if (data.hasOwnProperty('error')) {
                    this.gs.toast.present(data.error);
                    return;
                }
                const arcCodi = data.output[0].out_id;
                const dropboxObject = {
                    mode: 1,
                    path: 'documenti/',
                    id: arcCodi,
                    name: this.file.file.name,
                    type: this.file.file.type,
                    data: `data:${this.file.file.type};base64,${this.file.base64}`
                };
                this._ds.upload(dropboxObject).subscribe(data => {
                    this.gs.loading.dismiss();
                    this.esci(true);
                },error => this.gs.toast.present(error.message));
            },
            error => this.gs.toast.present(error.message, 5000));
    }

    esci(feedback = false) {
        this.modal.dismiss(feedback);
    }

}
