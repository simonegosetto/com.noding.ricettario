import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {GlobalService} from "../core/services/global.service";
import {ModalCaricaFileComponent} from "../archiviodocumento/modal-carica-file.component";
import {ModalService} from "../core/services/modal.service";

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
          this.ricerca.categorieDocumentiList = data.recordset ? [...data.recordset] : [];
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

  openCategoria(categoria: any) {
    sessionStorage.setItem('descrizioneCategoria', categoria.arc_tipo);
    this._router.navigate([`archiviodocumento/${categoria.arc_tipo}`]);
  }

}