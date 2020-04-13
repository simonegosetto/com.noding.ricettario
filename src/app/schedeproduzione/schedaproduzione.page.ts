import { Component, OnInit } from '@angular/core';
import {ModalSearchRicettaComponent} from "../ricetta/modal-search-ricetta.component";
import {environment} from "../../environments/environment";
import {ModalService} from "../core/services/modal.service";
import {SchedeProduzione, SchedeProduzioneRighe} from "../shared/interface/schede-produzione";
import {GlobalService} from "../core/services/global.service";
import {AlertService} from "../core/services/alert.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ListinoRead} from "../shared/interface/listino";

@Component({
  selector: 'ric-schedaproduzione',
  templateUrl: './schedaproduzione.page.html',
  styleUrls: ['./schedaproduzione.page.scss'],
})
export class SchedaproduzionePage implements OnInit {

  constructor(
      private _modal: ModalService,
      public gs: GlobalService,
      private _alert: AlertService,
      private _router: Router,
      private _route: ActivatedRoute,
  ) { }

  public ricetteList: SchedeProduzioneRighe[] = [];
  public schedaProduzione: SchedeProduzione = {} as SchedeProduzione;
  public listinoID: number;
  public listiniList: ListinoRead[] = [];

  ngOnInit() {
    const param = this._route.snapshot.paramMap.get('id');
    if (parseInt(param) > 0) {
      this.schedaProduzione.id = parseInt(param);
      this.schedaProduzione.descrizione = sessionStorage.getItem('schedaProduzioneDescrizione');
      this.getSchedaRighe();
    } else {
      this._router.navigate(['schedeproduzione'])
    }
    this._estrazioneListini();
  }

  private _estrazioneListini() {
    this.gs.callGateway('BnnFe0vU9aHbFGDCdwhl3h+5nSiRtsLXHgSRgQ803PAtWy0tSVYtWy3oQdVT2zI26QCrxbZr7SBgQ0QqM/cJWYN2qNm3Fq18Lw@@', ``).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this.listiniList = data.recordset ? data.recordset : [];
          if (this.listiniList.length > 0) {
            this.listinoID = this.listiniList[0].id;
          }
          this.gs.loading.dismiss();
        },
        error => this.gs.toast.present(error.message));
  }

  getSchedaRighe() {
    this.gs.callGateway('ZGrBRm2wXfzaxA55wgbIWsB1/YmoPntkZMcM/cQjtLAtWy0tSVYtWy1JhzOXXh74oQxLQr2i2SwqPirx4VWWefINmcScc4m97g@@',
        `${this.schedaProduzione.id}`).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this.ricetteList = data.recordset ? [...data.recordset] : [];
          this.gs.loading.dismiss();
        },
        error => this.gs.toast.present(error.message, 5000));
  }

  nuovaRicetta() {
    const modalCliente = this._modal.present(ModalSearchRicettaComponent, {});
    modalCliente.then(result => {
      if (result.data) {
        this.gs.callGateway('IlbwuISwJ/DBW0uy+ORTu0Ahc/u3Y+nIjqrQ1sd/PLADIHhO//BtdcHkAh+NtCRHVjdQUWhZ9BkJCQHT2xxBSy1bLS1JVi1bLfEH0UNkSMB7zAKeURhyfVO2o9Fth+h9BzgvVLtirIfg',
            `${this.schedaProduzione.id},${result.data.cod_p}`).subscribe(data => {
              if (data.hasOwnProperty('error')) {
                this.gs.toast.present(data.error);
                return;
              }
              this.getSchedaRighe();
              this.gs.loading.dismiss();
            },
            error => this.gs.toast.present(error.message, 5000));
      }
    });
  }

  delete(riga: SchedeProduzioneRighe) {
    const alertElimina = this._alert.confirm('Attenzione', `Confermi di eliminare la ricetta dalla scheda ?`);
    alertElimina.then(result => {
      if (result.role === 'OK') {
        this.gs.callGateway('S+jzb0ADwezeBPQYjHQC4GeltNyU5EsXIlR6m2gN66aa8pPcbUz8wxgmfuhRBA+lcRVOKKJLsoLPnpxoNA4g0C1bLS1JVi1bLaIfIFJTkiW5pAZxdtBC8yhE8eN3wnpirAbLS5tohJ7U', riga.id).subscribe(data => {
              if (data.hasOwnProperty('error')) {
                this.gs.toast.present(data.error);
                return;
              }
              this.getSchedaRighe();
              this.gs.loading.dismiss();
            },
            error => this.gs.toast.present(error.message, 5000));
      }
    });
  }

  print(foodCost: boolean) {
    if (this.ricetteList.length > 0) {
      window.open(environment.apiReportSchedaTecnica + "?gest=3&type=1&process=" + encodeURIComponent("3K2t3jzxjc+0a0dmj+eRVnotvAfJAoDjYQ/o8SAF2/wtWy0tSVYtWy15LcFBExarLwaeb6649Zrl8Rdbv9FDSmJwaBBc8C3e8g@@") +
          "&params="+this.ricetteList.map(r => r.ricettaid).join(',')+"&token="+localStorage.getItem("token")+"&report=schedatecnica.html&foodcost=" + (foodCost ? '1' : '0') + '&listino=' + this.listinoID +
          "&descrizione=" + encodeURIComponent(this.schedaProduzione.descrizione),
          "_blank");
    }
  }

}
