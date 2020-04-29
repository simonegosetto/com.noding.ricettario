import {Component, Input, OnInit} from '@angular/core';
import {Categoria} from "../shared/interface/categoria";
import {GlobalService} from "../core/services/global.service";
import {MenuRiga, MenuRigaSearch} from "../shared/interface/menu";
import {ModalService} from "../core/services/modal.service";
import {ModalSearchRicettaMenuComponent} from "./modal-search-ricetta-menu.component";
import {AlertService} from "../core/services/alert.service";

@Component({
  selector: 'ric-menu-alla-carta',
  templateUrl: './menu-alla-carta.component.html',
  styles: []
})
export class MenuAllaCartaComponent implements OnInit {

  constructor(
      public gs: GlobalService,
      private _modal: ModalService,
      private _alert: AlertService,
  ) { }

  @Input() menuid: number;
  @Input() listinoid: number;
  public menuRiga: MenuRiga = {} as MenuRiga;
  public categorieList: Categoria[] = [];
  public righeList: MenuRigaSearch[] = [];

  ngOnInit() {
    this._estrazioneCategorie();
  }

  private _estrazioneCategorie() {
    this.gs.callGateway('FNopVUZX6gB8wiOOkcYZoNc/DQsOMebhfWb9Uy5bteItWy0tSVYtWy2RMZrggPg/kUT4un9OQHLCOS1ESKsrvLjZFAvn5tp3VQ@@',``).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this.categorieList = data.recordset ? [...data.recordset] : [];
          this._estrazione();
          this.gs.loading.dismiss();
        },
        error => this.gs.toast.present(error.message, 5000));
  }

  searchRicetta() {
    const modalSearchRicetta = this._modal.present(ModalSearchRicettaMenuComponent, {});
    modalSearchRicetta.then(result => {
      if (result.data) {
        this.menuRiga.ricettaid = result.data.cod_p;
        this.menuRiga.nome_ric = result.data.nome_ric;
      }
    });
  }

  save() {
    if (
        this.gs.isnull(this.menuRiga.menucategoriaid,0) == 0 ||
        this.gs.isnull(this.menuRiga.ricettaid,0) == 0 ||
        this.gs.isnull(this.menuid,0) == 0
    ) {
      this.gs.toast.present('Campi obbligatori mancanti !');
      return;
    }

    this.gs.callGateway('4EKFMSLcQErqesydVFFs5MsgUMVAnsk6dEJL6HKiuJ4tWy0tSVYtWy3rWCf0m7d18zKWD0qTdpZ5nrElD4jbP/gbWu8yWlij+A@@',
        `${this.menuid},${this.menuRiga.ricettaid},${this.menuRiga.menucategoriaid}`).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this._estrazione();
          this.gs.loading.dismiss();
        },
        error => this.gs.toast.present(error.message, 5000));
  }

  delete($event, riga: MenuRigaSearch) {
    $event.stopPropagation();
    const alertElimina = this._alert.confirm('Attenzione', `Confermi di eliminare il piatto ${riga.descrizione} ?`);
    alertElimina.then(result => {
      if (result.role === 'OK') {
        this.gs.callGateway('ucPKP4vgLwFswQYd3kYSXH49AtOVNz6n57HE4QChZOAtWy0tSVYtWy1cBMOHmEBYZ5ahYrEc8UnPWdkZo4MLYEwx/AiyDiHvsw@@', riga.id).subscribe(data => {
              if (data.hasOwnProperty('error')) {
                this.gs.toast.present(data.error);
                return;
              }
              this._estrazione();
              this.gs.loading.dismiss();
            },
            error => this.gs.toast.present(error.message, 5000));
      }
    });
  }

  private _estrazione() {
    this.gs.callGateway('psv6VQSAtEEbFZMQFsqECpPHcS39sQCLkeYlWTsSz+QtWy0tSVYtWy3Yp+JgJC//klU7QOi+O80sdHpj9guvh0v/3I34nk2LMg@@',`${this.menuid},${this.listinoid}`).subscribe(data => {
      if (data.hasOwnProperty('error')) {
        this.gs.toast.present(data.error);
        return;
      }
      this.righeList= data.recordset ? [...data.recordset] : [];
      this.gs.loading.dismiss();
    }, error => this.gs.toast.present(error.message, 5000));
  }

}
