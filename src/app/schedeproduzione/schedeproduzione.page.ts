import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {AlertService} from "../core/services/alert.service";
import {ModalService} from "../core/services/modal.service";
import {GlobalService} from "../core/services/global.service";
import {ModalDescrizioneComponent} from "../shared/modal/modal-descrizione.component";
import {ModalConfig} from "../core/interfaces/modal-config";
import {SchedeProduzione, SchedeProduzioneRead} from "../shared/interface/schede-produzione";

@Component({
  selector: 'ric-schedeproduzione',
  templateUrl: './schedeproduzione.page.html',
  styles: [`
    ion-icon {
      font-size: 25px;
    }
  `]
})
export class SchedeproduzionePage implements OnInit {

  constructor(
      private _router: Router,
      private _alert: AlertService,
      private _modal: ModalService,
      public gs: GlobalService,
  ) { }

  public ricerca = {
    searchText: '',
    categoria:  0,
    pageSize: 10,
    progressSize: 10,
    schedeList: [] as SchedeProduzioneRead[],
  };

  ngOnInit() {
    this.list();
  }

  list(event = null) {
    this.gs.callGateway('JF8yXz5TOp18Sotb5VMkfjvUv8HmSOtIm4S02S8XjQ4tWy0tSVYtWy1YFqLxfMIhA3RMGauQYR2m5e5tPNHBFW8t1VyFVpA8lg@@',``).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this.ricerca.schedeList = data.recordset ? [...data.recordset] : [];
          if (event) {
            event.target.complete();
          }
          this.gs.loading.dismiss();
        },
        error => this.gs.toast.present(error.message, 5000));
  }

  open(scheda: SchedeProduzioneRead) {
    sessionStorage.setItem('schedaProduzioneDescrizione', scheda.descrizione);
    this._router.navigate([`schedaproduzione/${scheda.id}`]);
  }

  nuovo() {
    const modalNew = this._modal.present(ModalDescrizioneComponent, {title: 'Nuova Scheda', cancelText: 'Annulla', confirmText: 'Salva', data: {}} as ModalConfig);
    modalNew.then(result => {
      if (result.data && result.data.descrizione) {
        const {descrizione} = result.data;
        this._saveListino({id: 0, descrizione} as SchedeProduzione);
      }
    });
  }

  private _saveListino(scheda: SchedeProduzione) {
    this.gs.callGateway('xHdQPwuFw1H1KO/cRHQlPrTaWgxmNT3nS5b9YaOBlW4tWy0tSVYtWy04WGL10k1ciZBMp7DlMdlugRxaidsNbmKfPeBzmzmpxQ@@',
        `${scheda.id},'${scheda.descrizione}'`).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this.list();
          this.gs.loading.dismiss();
        },
        error => this.gs.toast.present(error.message, 5000));
  }

  edit($event, scheda: SchedeProduzioneRead) {
    $event.stopPropagation();
    const modalNew = this._modal.present(ModalDescrizioneComponent, {title: 'Modifica Scheda', cancelText: 'Annulla', confirmText: 'Salva', data: {...scheda}} as ModalConfig);
    modalNew.then(result => {
      if (result.data && result.data.descrizione) {
        const {id, descrizione} = result.data;
        this._saveListino({id, descrizione} as SchedeProduzione);
      }
    });
  }

  delete($event, scheda: SchedeProduzioneRead) {
    $event.stopPropagation();
    const alertElimina = this._alert.confirm('Attenzione', `Confermi di eliminare il listino ${scheda.descrizione} ?`);
    alertElimina.then(result => {
      if (result.role === 'OK') {
        this.gs.callGateway('b6MZgUoZ3Wk49DsGooqOlsxO+MzfsReH/y0uLX63xF4tWy0tSVYtWy33pNRXlrm4nwQ988rgLtrOLEvfmvS36E+aklKoi80BPA@@', scheda.id).subscribe(data => {
              if (data.hasOwnProperty('error')) {
                this.gs.toast.present(data.error);
                return;
              }
              this.list();
              this.gs.loading.dismiss();
            },
            error => this.gs.toast.present(error.message, 5000));
      }
    });
  }

}
