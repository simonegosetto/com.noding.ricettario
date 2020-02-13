import { Component } from '@angular/core';
import {ModalSearchRicettaComponent} from "../ricetta/modal-search-ricetta.component";
import {ModalService} from "../core/services/modal.service";
import {environment} from "../../environments/environment";

@Component({
  selector: 'ric-schedetecniche',
  templateUrl: './schedetecniche.page.html',
  styleUrls: ['./schedetecniche.page.scss'],
})
export class SchedetecnichePage {

  constructor(
      private _modal: ModalService,
  ) { }

  public ricetteList: Array<{ricettaid: number}> = [];


  nuovaRicetta() {
    const modalCliente = this._modal.present(ModalSearchRicettaComponent, {});
    modalCliente.then(result => {
      if (result.data) {
        const {cod_p} = result.data;
        this.ricetteList = [...this.ricetteList, {ricettaid: cod_p}];
      }
    });
  }

  print() {
    if (this.ricetteList.length > 0) {
      window.open(environment.apiReportSchedaTecnica + "?gest=3&type=1&process=" + encodeURIComponent("3K2t3jzxjc+0a0dmj+eRVnotvAfJAoDjYQ/o8SAF2/wtWy0tSVYtWy15LcFBExarLwaeb6649Zrl8Rdbv9FDSmJwaBBc8C3e8g@@") +
          "&params="+this.ricetteList.map(r => r.ricettaid).join(',')+"&token="+localStorage.getItem("token")+"&report=schedatecnica.html",
          "_blank");
    }
  }
}
