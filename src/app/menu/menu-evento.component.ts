import {Component, Input, OnInit} from '@angular/core';
import {GlobalService} from "../core/services/global.service";
import {ModalService} from "../core/services/modal.service";
import {AlertService} from "../core/services/alert.service";
import {Menu, MenuRiga, MenuRigaSearch, MenuTotali} from "../shared/interface/menu";
import {ModalSearchRicettaMenuComponent} from "./modal-search-ricetta-menu.component";

@Component({
  selector: 'ric-menu-evento',
  templateUrl: './menu-evento.component.html',
  styles: []
})
export class MenuEventoComponent implements OnInit {

  constructor(
      public gs: GlobalService,
      private _modal: ModalService,
      private _alert: AlertService,
  ) { }

  @Input() menu: Menu;
  @Input() listinoid: number;
  public menuRiga: MenuRiga = {} as MenuRiga;
  public righeList: MenuRigaSearch[] = [];
  public menuTotali: MenuTotali = {} as MenuTotali;

  ngOnInit() {
    this._estrazione();
  }

  private _estrazione() {
    this.gs.callGateway('gmWVJZP+UGV9KGcRG53D30i0ozWILb/EMajQiDrIEastWy0tSVYtWy3BMu7OQxzscLI2Tq9rx7i26t6Ra97143uOpKI178zF1w@@',`${this.menu.id},${this.listinoid}`).subscribe(data => {
      if (data.hasOwnProperty('error')) {
        this.gs.toast.present(data.error);
        return;
      }
      this.righeList= data.recordset ? [...data.recordset] : [];
      this.totaliGet();
      this.gs.loading.dismiss();
    }, error => this.gs.toast.present(error.message, 5000));
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

  save() {
    if (
        this.gs.isnull(this.menuRiga.ricettaid,0) == 0 ||
        this.gs.isnull(this.menu.id,0) == 0
    ) {
      this.gs.toast.present('Campi obbligatori mancanti !');
      return;
    }

    this.gs.callGateway('4EKFMSLcQErqesydVFFs5MsgUMVAnsk6dEJL6HKiuJ4tWy0tSVYtWy3rWCf0m7d18zKWD0qTdpZ5nrElD4jbP/gbWu8yWlij+A@@',
        `${this.menu.id},${this.menuRiga.ricettaid},0`).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this._estrazione();
          this.gs.loading.dismiss();
        }, error => this.gs.toast.present(error.message, 5000));
  }

  aggiornaMenu() {
    this.gs.callGateway('fqSIBghvRnSQ3MgfxEa5hzSJrTnuUrl/KmoPJqpLVuotWy0tSVYtWy0bKOK/0/Gx2zq8WP1fh0DpzYkmaXcymyb9qV+FiPj+HQ@@',
        `${this.menu.id},${this.menu.pax},${this.menu.perc_ricetta}`).subscribe(data => {
      if (data.hasOwnProperty('error')) {
        this.gs.toast.present(data.error);
        return;
      }
      this.totaliGet();
      this.gs.loading.dismiss();
    }, error => this.gs.toast.present(error.message, 5000));
  }

  totaliGet() {
    this.gs.callGateway('AhzhmjtF+z/CNSybI+oPMsvY8bgo02n2+Kccc5ifI44tWy0tSVYtWy2A3OleBbhIztblymLHcptfGLTotAqZ5MFdbdj4eyjhaA@@',
        `${this.menu.id},${this.listinoid}`).subscribe(data => {
      if (data.hasOwnProperty('error')) {
        this.gs.toast.present(data.error);
        return;
      }
      this.menuTotali = {...data.recordset[0]};
      this.gs.loading.dismiss();
    }, error => this.gs.toast.present(error.message, 5000));
  }

}
