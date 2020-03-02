import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {GlobalService} from "../core/services/global.service";
import {ModalCaricaFileComponent} from "../archiviodocumento/modal-carica-file.component";
import {ModalService} from "../core/services/modal.service";
import {AlertService} from "../core/services/alert.service";

@Component({
  selector: 'ric-archiviodocumenti',
  templateUrl: './archiviodocumenti.page.html',
  styleUrls: ['./archiviodocumenti.page.scss'],
})
export class ArchiviodocumentiPage implements OnInit {

  constructor(
      private _router: Router,
      public gs: GlobalService,
      private _modal: ModalService,
      private _alert: AlertService,
  ) { }

  public ricerca = {
    searchText: '',
    pageSize: 10,
    progressSize: 10,
    categorieDocumentiList: []
  };

  ngOnInit() {
    this.estrazioneCategorieDocumenti();
  }

  estrazioneCategorieDocumenti(event = null) {
    this.gs.callGateway('0i2+RmInGMX0DvOaBMb2+YgiKEYyPyb1UckrhmUoRUotWy0tSVYtWy0xLsiHvQYzJJ7lAyA1aGtvSXKul9MHKkoycGAVlT+pvg@@',``).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this.ricerca.categorieDocumentiList = data.recordset ? [...data.recordset].map(item => {
              item.arc_tipo2 = item.arc_tipo;
              return item;
          }) : [];
          if (event) {
            event.target.complete();
          }
          this.gs.loading.dismiss();
        },
        error => this.gs.toast.present(error.message, 5000));
  }

    nuovoFile() {
        const modalCliente = this._modal.present(ModalCaricaFileComponent, {});
        modalCliente.then(result => {
            this.estrazioneCategorieDocumenti();
        });
    }

    deleteCategoria($event, categoria: any) {
      $event.stopPropagation();
        const alertElimina = this._alert.confirm('Attenzione', `Confermi di eliminare della categoria di file ?`);
        alertElimina.then(result => {
            if (result.role === 'OK') {
                this.gs.callGateway('Eqaubeb/1EWGwXrVhza3wWU9gSJA7HkHcKgLV7vPlM0tWy0tSVYtWy1QSPD1kqzevI5N4CNLovLKIbpEC+9KMm0ut7L0n4SZWA@@', `'${categoria.arc_tipo}'`).subscribe(data => {
                        if (data.hasOwnProperty('error')) {
                            this.gs.toast.present(data.error);
                            return;
                        }
                        // this._ds.delete({mode: 3, path: file.id_storage}).subscribe(data => { }, error => this.gs.toast.present(error.message));
                        this.estrazioneCategorieDocumenti();
                        this.gs.loading.dismiss();
                    },
                    error => this.gs.toast.present(error.message));
            }
        });
    }

    updateCategoria(categoria: any) {
        this.gs.callGateway('CrzkD5VWT0n6nR248tA+6SDxowmC51B/od4lqXAr3q8tWy0tSVYtWy2/GYRCkd2tb21VurTJWim6CYwVAz3Bx+o4IXFpJCoskQ@@', `'${categoria.arc_tipo}','${categoria.arc_tipo2}'`).subscribe(data => {
                if (data.hasOwnProperty('error')) {
                    this.gs.toast.present(data.error);
                    return;
                }
                this.estrazioneCategorieDocumenti();
                this.gs.loading.dismiss();
            },
            error => this.gs.toast.present(error.message));
    }

  openCategoria(categoria: any) {
    sessionStorage.setItem('descrizioneCategoria', categoria.arc_tipo);
    this._router.navigate([`archiviodocumento/${categoria.arc_tipo}`]);
  }

}
