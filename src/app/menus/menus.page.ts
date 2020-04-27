import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {AlertService} from "../core/services/alert.service";
import {GlobalService} from "../core/services/global.service";
import {Menu, MenuRead} from "../shared/interface/menu";
import {IngredienteRead} from "../shared/interface/ingrediente";
import {ModalDescrizioneComponent} from "../shared/modal/modal-descrizione.component";
import {ModalConfig} from "../core/interfaces/modal-config";
import {Listino, ListinoRead} from "../shared/interface/listino";
import {ModalService} from "../core/services/modal.service";


@Component({
  selector: 'ric-menus',
  templateUrl: './menus.page.html',
  styleUrls: ['./menus.page.scss'],
})
export class MenusPage implements OnInit {

  constructor(
      private _router: Router,
      private _alert: AlertService,
      public gs: GlobalService,
      private _modal: ModalService,
  ) { }

  public ricerca = {
    searchText: '',
    categoria:  0,
    pageSize: 10,
    progressSize: 10,
    menuList: [] as MenuRead[],
  };

  ngOnInit() {
    this.estrazione();
  }

  estrazione(event = null) {
    this.gs.callGateway('okb5t42MzxMMO10EgkksbFQpXCzgQLrxVnqW8dDhrW0tWy0tSVYtWy2QU3GxVikgfK/sdvifCsRO5yJOE90sdeoUckFl95Ocfg@@',``).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this.ricerca.menuList = data.recordset ? [...data.recordset] : [];
          if (event) {
            event.target.complete();
          }
          this.gs.loading.dismiss();
        },
        error => this.gs.toast.present(error.message, 5000));
  }

  open(menu: MenuRead) {
    this._router.navigate([`menu/${menu.id}`]);
  }

  nuovo() {
    const modalNew = this._modal.present(ModalDescrizioneComponent, {
      title: 'Nuovo Menù',
      cancelText: 'Annulla',
      confirmText: 'Salva',
      data: {tipo: 1}
    } as ModalConfig);
    modalNew.then(result => {
      if (result.data && result.data.descrizione) {
        const {descrizione, tipo} = result.data;
        this._save({id: 0, descrizione, tipo} as Menu);
      }
    });
  }

  edit($event, menu: MenuRead) {
    $event.stopPropagation();
    const modalNew = this._modal.present(ModalDescrizioneComponent, {
      title: 'Modifica Menù',
      cancelText: 'Annulla',
      confirmText: 'Salva',
      data: {...menu}
    } as ModalConfig);
    modalNew.then(result => {
      if (result.data && result.data.descrizione) {
        const {id, descrizione, tipo} = result.data;
        this._save({id, descrizione, tipo} as Menu);
      }
    });
  }

  private _save(listino: Menu) {
    this.gs.callGateway('nQ6vGlNTQWOFq9x+Eo5WHKSu26dR8u+cVJ4yRdbgFyEtWy0tSVYtWy17tl03kprmq8PVPclI5j0NKh4awp8QeZinUz6gvwlRSw@@',
        `${listino.id},'${listino.descrizione}',${listino.tipo},0,0`).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this.estrazione();
          this.gs.loading.dismiss();
        },
        error => this.gs.toast.present(error.message, 5000));
  }

  delete($event, menu: MenuRead) {
    $event.stopPropagation();
    const alertElimina = this._alert.confirm('Attenzione', `Confermi di eliminare il menù ${menu.descrizione} ?`);
    alertElimina.then(result => {
      if (result.role === 'OK') {
        this.gs.callGateway('b20k0izyEWj8NwW0XI+4P2G7glsRp2Np4K9edlm57/ktWy0tSVYtWy2mhb68JrCq7bjwMdEzlVlt7b8aTBmEnARp939rBwssnQ@@', menu.id).subscribe(data => {
              if (data.hasOwnProperty('error')) {
                this.gs.toast.present(data.error);
                return;
              }
              this.estrazione();
              this.gs.loading.dismiss();
            },
            error => this.gs.toast.present(error.message, 5000)
        );
      }
    });
  }

}
