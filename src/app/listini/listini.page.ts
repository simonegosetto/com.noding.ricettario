import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {AlertService} from "../core/services/alert.service";
import {GlobalService} from "../core/services/global.service";
import {Listino, ListinoRead} from "../shared/interface/listino";
import {ModalService} from "../core/services/modal.service";
import {ModalConfig} from "../core/interfaces/modal-config";
import {ModalDescrizioneComponent} from "../shared/modal/modal-descrizione.component";

@Component({
  selector: 'ric-listini',
  templateUrl: './listini.page.html',
  styleUrls: ['./listini.page.scss'],
})
export class ListiniPage implements OnInit {

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
    listiniList: [] as ListinoRead[],
  };

  ngOnInit() {
    this.estrazioneListini();
  }

  estrazioneListini(event = null) {
    this.gs.callGateway('BnnFe0vU9aHbFGDCdwhl3h+5nSiRtsLXHgSRgQ803PAtWy0tSVYtWy3oQdVT2zI26QCrxbZr7SBgQ0QqM/cJWYN2qNm3Fq18Lw@@',``).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this.ricerca.listiniList = data.recordset ? [...data.recordset] : [];
          if (event) {
            event.target.complete();
          }
          this.gs.loading.dismiss();
        },
        error => this.gs.toast.present(error.message, 5000));
  }

  openListino(listino: ListinoRead) {
    sessionStorage.setItem('listinoDescrizione', listino.descrizione);
    this._router.navigate([`listino/${listino.id}`]);
  }

  nuovoListino() {
      const modalNew = this._modal.present(ModalDescrizioneComponent, {title: 'Nuovo Listino', cancelText: 'Annulla', confirmText: 'Salva', data: { aliquota: 0}} as ModalConfig);
      modalNew.then(result => {
          if (result.data && result.data.descrizione) {
              const {descrizione, aliquota} = result.data;
              this._saveListino({id: 0, descrizione, aliquota} as Listino);
          }
      });
  }

  private _saveListino(listino: Listino) {
      this.gs.callGateway('+qE5v3SYnfwew9ERUdNFtDBPcIEX1WHvlPw2rWnt9Z4tWy0tSVYtWy32eWs2dLQzwdu3PT0V1eHN6VOHoiA8WwUBNx9X9PtdvA@@',
          `${listino.id},'${listino.descrizione}',${listino.aliquota}`).subscribe(data => {
              if (data.hasOwnProperty('error')) {
                  this.gs.toast.present(data.error);
                  return;
              }
              this.estrazioneListini();
              this.gs.loading.dismiss();
          },
          error => this.gs.toast.present(error.message, 5000));
  }

  edit($event, listino: ListinoRead) {
      $event.stopPropagation();
      const modalNew = this._modal.present(ModalDescrizioneComponent, {title: 'Modifica Listino', cancelText: 'Annulla', confirmText: 'Salva', data: {...listino}} as ModalConfig);
      modalNew.then(result => {
          if (result.data && result.data.descrizione) {
              const {id, descrizione, aliquota} = result.data;
              this._saveListino({id, descrizione, aliquota} as Listino);
          }
      });
  }

  deleteListino($event, listino: ListinoRead) {
    $event.stopPropagation();
    const alertElimina = this._alert.confirm('Attenzione', `Confermi di eliminare il listino ${listino.descrizione} ?`);
    alertElimina.then(result => {
      if (result.role === 'OK') {
        this.gs.callGateway('O8ucerAGcmc2Pe61cYP8sNIGcx1t13A4chm0RwJc+eYtWy0tSVYtWy1qBXDOjMpc/IvwECjY/mIGAU97Ykeme0fjs4mW6qbRXQ@@', listino.id).subscribe(data => {
              if (data.hasOwnProperty('error')) {
                this.gs.toast.present(data.error);
                return;
              }
              this.estrazioneListini();
              this.gs.loading.dismiss();
            },
            error => this.gs.toast.present(error.message, 5000));
      }
    });
  }

}
