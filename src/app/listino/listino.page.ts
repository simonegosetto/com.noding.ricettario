import { Component, OnInit } from '@angular/core';
import {GlobalService} from "../core/services/global.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastService} from "../core/services/toast.service";
import {AlertService} from "../core/services/alert.service";
import {Categoria} from "../shared/interface/categoria";
import {Listino, ListinoRead, ListinoRiga} from "../shared/interface/listino";
import {ModalService} from "../core/services/modal.service";
import {ModalSearchRicettaListinoComponent} from "./modal-search-ricetta-listino.component";
import {ModalSearchIngredienteListinoComponent} from "./modal-search-ingrediente-listino.component";
import {ModalEditIngredienteListinoComponent} from "./modal-edit-ingrediente-listino.component";
import {Ingrediente, IngredienteListino} from "../shared/interface/ingrediente";
import {environment} from "../../environments/environment";

@Component({
  selector: 'ric-listino',
  templateUrl: './listino.page.html',
  styleUrls: ['./listino.page.scss'],
})
export class ListinoPage implements OnInit {

  constructor(
      public gs: GlobalService,
      private _route: ActivatedRoute,
      private _toast: ToastService,
      private _alert: AlertService,
      private _router: Router,
      private _modal: ModalService,
  ) { }

  public listino: Listino = {} as Listino;
  public categorieList: Categoria[] = [];
  public ricerca = {
    searchText: '',
    categoria:  0,
    pageSize: 10,
    progressSize: 10,
    righeList: [] as ListinoRiga[],
  };

  ngOnInit() {
    const param = this._route.snapshot.paramMap.get('id');
    if (parseInt(param) > 0) {
      this.listino.id = parseInt(param);
      this.listino.descrizione = sessionStorage.getItem('listinoDescrizione');
      this.getListinoRighe();
    } else {
      this._router.navigate(['listini'])
    }
    this._estrazioneCategorie();
  }

  private _estrazioneCategorie() {
    this.gs.callGateway('gKAvUn6c5bcp110Jh/vcbsnEbwctvJY0zl6gC0K3qa4tWy0tSVYtWy1H1JD+sBUdce4kGbfi8PFOJ6glv1neuYU/19MzXKDDSQ@@',``).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this.categorieList = data.recordset ? [...data.recordset] : [];
          this.gs.loading.dismiss();
        },
        error => this.gs.toast.present(error.message, 5000));
  }

  getListinoRighe(event = null) {
    this.gs.callGateway('j8nnE18DvMJLJn72/pLhFHuvrOA97O1D70EeY0K28/otWy0tSVYtWy1k5ipImnHJdjEgS2084WWHruF1SwXI5uZouBYSWHPGGQ@@',
        `${this.listino.id},${this.ricerca.categoria}`).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this.ricerca.righeList = data.recordset ? [...data.recordset] : [];
          if (event) {
            event.target.complete();
          }
          this.gs.loading.dismiss();
        },
        error => this.gs.toast.present(error.message, 5000));
  }

    print() {
        window.open(environment.apiReportListino + "?params=" + this.listino.id + "&categoria=" + this.ricerca.categoria + "&token=" + localStorage.getItem("token"), "_blank");
    }

  edit($event, riga: ListinoRiga) {
    $event.stopPropagation();
    const modalEditIngrediente = this._modal.present(ModalEditIngredienteListinoComponent, {...riga, categorieList: this.categorieList});
    modalEditIngrediente.then(result => {
      if (result.data) {
        this._updateIngrediente(result.data);
      }
    });
  }

  delete($event, riga: ListinoRiga) {
    $event.stopPropagation();
    const alertElimina = this._alert.confirm('Attenzione', `Confermi di eliminare l'ingrediente ${riga.descrizione} ?`);
    alertElimina.then(result => {
      if (result.role === 'OK') {
        this.gs.callGateway('OemnSwfiRPzAVbNM8+3RBZ4O4zVb5T9yN53H7Ax02YwtWy0tSVYtWy0lxrGjs502JyZQihu3oKcFrDNuTa+3V95N9HRsztRp2A@@', riga.id).subscribe(data => {
              if (data.hasOwnProperty('error')) {
                this.gs.toast.present(data.error);
                return;
              }
              this.getListinoRighe();
              this.gs.loading.dismiss();
            },
            error => this.gs.toast.present(error.message, 5000));
      }
    });
  }

  nuovoFromIngrediente() {
    const modalNewFromIngrediente = this._modal.present(ModalSearchIngredienteListinoComponent, {});
    modalNewFromIngrediente.then(result => {
      if (result.data) {
        this._saveIngrediente(result.data);
      }
    });
  }

  nuovoFromSchedaTecnica() {
    const modalNewFromSchedaTecnica = this._modal.present(ModalSearchRicettaListinoComponent, {});
    modalNewFromSchedaTecnica.then(result => {
      if (result.data) {
        this._saveSchedaTecnica(result.data);
      }
    });
  }

  private _saveSchedaTecnica(schedaTecnicaID: number) {
    this.gs.callGateway('M+znAuYqN5Ug1l2iGVkxduf1lbRlT1UuSoxLW1oid8stWy0tSVYtWy34EKDV2l7UJrjG/oWkhSl8rBxmw+GSDbr4MKJeU8pXfA@@',
        `${this.listino.id},${schedaTecnicaID}`).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this.getListinoRighe();
          this.gs.loading.dismiss();
        },
        error => this.gs.toast.present(error.message, 5000));
  }

  private _saveIngrediente(ingredienteID: number) {
    this.gs.callGateway('E+pKhhlKoT3QoiETImqtg7Tm6Zt2Hw828idhcpov3FeYPL2p7Y+IYRhDaAM1DR/OZYyzo/TQq8WD17k93BrohS1bLS1JVi1bLddOB+8ied/iwzy2sftWM7NH2B+A3DlBQJmKEMJu0DNp',
        `${this.listino.id},${ingredienteID}`).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this.getListinoRighe();
          this.gs.loading.dismiss();
        },
        error => this.gs.toast.present(error.message, 5000));

  }

  private _updateIngrediente(ingrediente: IngredienteListino) {
    this.gs.callGateway('/nGnbEpkUi0vOg4i6e1iuEGuxg69lsTmVCr8YyLq268tWy0tSVYtWy3L2b8m+30DhYzDhrNYxDVYk6RvH3uhYOxox9hDnFFDyQ@@',
        `${ingrediente.id},${ingrediente.scarto},${ingrediente.grammatura},${ingrediente.prezzo},${ingrediente.categoriaid},${ingrediente.kcal},'${ingrediente.descrizione}','${ingrediente.provenienza}'`
    ).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this.gs.loading.dismiss();
          this.getListinoRighe();
          this.gs.toast.present('Ingrediente salvato correttamente !');
        },
        error => this.gs.toast.present(error.message));
  }


}
