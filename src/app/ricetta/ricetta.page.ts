import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {GlobalService} from "../core/services/global.service";
import {ActivatedRoute} from "@angular/router";
import {ToastService} from "../core/services/toast.service";
import {LoadingService} from "../core/services/loading.service";
import {AlertService} from "../core/services/alert.service";
import {ModalSearchRicettaComponent} from "./modal-search-ricetta.component";
import {ModalService} from "../core/services/modal.service";
import {DropboxService} from "../core/services/dropbox.service";
import {environment} from "../../environments/environment";

@Component({
  selector: 'ric-ricetta',
  templateUrl: './ricetta.page.html',
  styleUrls: ['./ricetta.page.scss'],
})
export class RicettaPage implements OnInit {

  @ViewChild('nomeIngrediente', {static: false}) nomeIngrediente;

  constructor(
      public gs: GlobalService,
      private _route: ActivatedRoute,
      private _toast: ToastService,
      private _loading: LoadingService,
      private _alert: AlertService,
      private _modal: ModalService,
      private _ds: DropboxService,
      public changeDetection: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const param = this._route.snapshot.paramMap.get('id');
    if (parseInt(param) > 0) {
      this.ricetta.cod_p = param;
      this.getRicetta();
    } else {
      this.ricetta.cod_p = '0';
    }
  }

  public ricetta: any = {
    file: undefined,
    base64textString: undefined,
    ingredientiList: [],
    ricetteComposteList: []
  };
  public ricettaRow: any = {
    nome: undefined,
    quantita: undefined,
    ricettaid: 0
  };

  ionViewLoaded() {
    setTimeout(() => {
      this.nomeIngrediente.setFocus();
    },150);

  }

  getRicetta(forImage = false) {
    this.gs.callGateway('3K2t3jzxjc+0a0dmj+eRVnotvAfJAoDjYQ/o8SAF2/wtWy0tSVYtWy15LcFBExarLwaeb6649Zrl8Rdbv9FDSmJwaBBc8C3e8g@@',`${this.ricetta.cod_p}`).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this.ricetta = {...this.ricetta, ...data.recordset[0]};
          if (this.ricetta.id_storage) {
              this._getRicettaImage();
          } else {
              this.ricetta.image = undefined;
          }
          if (!forImage) {
              this._estrazioneRighe();
          }
          this.gs.loading.dismiss();
        },
        error => this.gs.toast.present(error.message));
  }

  private _getRicettaImage() {
      this._ds.get({mode: 4, path: this.ricetta.id_storage}).subscribe(image => {
          this.ricetta.image = image.link;
          this.changeDetection.detectChanges();
      }, error => this.gs.toast.present(error.message));
  }

  private _estrazioneRighe() {
    this.gs.callGateway('SK1mkQH9EPMbEjkXjVKh208J+h4RyoSZdYvjFW/IwVEtWy0tSVYtWy13aAC10tFq5lY4fyaPFRki0Z709DrH0ocLUEzAss/mUw@@',`${this.ricetta.cod_p}`).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this.ricetta.ingredientiList = data.recordset ? [...data.recordset] : [];
          this.gs.loading.dismiss();
          this._estrazioneRicetteCollegate();
        },
        error => this.gs.toast.present(error.message));
  }

  private _estrazioneRicetteCollegate() {
      this.gs.callGateway('VwCLXZp2b7f0ntDBmDtjQiMqA71icSP05BfmU0Opi4ydvEX+uB0U2OIODrusGLmNjWldKOX7EhnVg0nsIWMR4S1bLS1JVi1bLQBR2FofNJE57bLSH6oD630781d1Qx+bHhnMTeAjnNz7',`${this.ricetta.cod_p}`).subscribe(data => {
              if (data.hasOwnProperty('error')) {
                  this.gs.toast.present(data.error);
                  return;
              }
              this.ricetta.ricetteComposteList = data.recordset ? [...data.recordset] : [];
              this.gs.loading.dismiss();
          },
          error => this.gs.toast.present(error.message));
  }

  saveRicetta() {
    this.gs.callGateway('yQyvP6kwRmZ4Y01UsKulxCxG7MGV0B1QcUxCK6U5SEItWy0tSVYtWy2d8paOBfaJ5qGKfIV63SdsTxDcVhwM2zTsER5z6D9tRA@@',
        `${this.ricetta.cod_p},'${this.ricetta.nome_ric}','${this.ricetta.procedimento}',@out_id`).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this.ricetta.cod_p = data.output[0].out_id;
          this.gs.loading.dismiss();
        },
        error => this.gs.toast.present(error.message));
  }

  ricettaRigaRemove(ricetta: any) {
    const alertElimina = this._alert.confirm('Attenzione', `Sicuro di voler eliminare l'ingrediente ?`);
    alertElimina.then(result => {
      if (result.role === 'OK') {
        this.gs.callGateway('vfJfFKZbzrsaJb7bIJecJqRgXqZvAc6fabCR8kZsd54tWy0tSVYtWy08zCYMCPxN5BXakZn0lgF2O3YSA7SIA4b8KsDaOqkiew@@', `${ricetta.id},${this.ricetta.cod_p}`).subscribe(data => {
              if (data.hasOwnProperty('error')) {
                this.gs.toast.present(data.error);
                return;
              }
              this._estrazioneRighe();
              this.gs.loading.dismiss();
              this._clearAndFocus();
            },
            error => this.gs.toast.present(error.message));
      }
    });
  }

    ricettaImageRemove() {
        const alertElimina = this._alert.confirm('Attenzione', `Sicuro di voler eliminare l'immagine ?`);
        alertElimina.then(result => {
            if (result.role === 'OK') {
                this._ds.delete({mode: 3, path: this.ricetta.id_storage}).subscribe(data => {
                  this.getRicetta(true);
                }, error => this.gs.toast.present(error.message));
            }
        });
    }

  ricettaRigaSave() {
    if (this.gs.isnull(this.ricettaRow.nome) === '') return;
    this.gs.callGateway('3FdtgGhTrxqXmygCCFfZC42j7tE0rFd0h9sihx5l9dAtWy0tSVYtWy3J487uKuF6tzHQ4E0jkvcdftWCBjuP1hUEY2rMzQw5dA@@',
        `'${this.ricettaRow.nome}',${this.gs.isnull(this.ricettaRow.quantita,0)},${this.ricettaRow.ricettaid},${this.ricetta.cod_p}`).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this._estrazioneRighe();
          this.gs.loading.dismiss();
          this._clearAndFocus();
        },
        error => this.gs.toast.present(error.message));
  }

  ricettaRigaUpdate(ingrediente: any) {
    if (this.gs.isnull(ingrediente.nome) === '') return;
    this.gs.callGateway('6zQerYGHbHjqJ2mcZ0Cq7s6u4WvD9BUcZNrwCU6lIs1nWPVmS5uQHPSLCfdDxsBrKqIfnpEzfVTKbrHits8xAi1bLS1JVi1bLdVYqY1PE/RxFVIKfNtzGacSHOvQPRefO+sHYpJEM1Vb',
        `${ingrediente.id},'${ingrediente.nome}',${this.gs.isnull(ingrediente.quantita,0)},${ingrediente.ricettaid},${this.ricetta.cod_p}`).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this._estrazioneRighe();
          this.gs.loading.dismiss();
          this._clearAndFocus();
        },
        error => this.gs.toast.present(error.message));
  }

  searchRicetta() {
    const modalCliente = this._modal.present(ModalSearchRicettaComponent, {});
    modalCliente.then(result => {
      if (result.data) {
        const {nome_ric, cod_p} = result.data;
        this.ricettaRow.nome = nome_ric;
        this.ricettaRow.ricettaid = cod_p;
        this.ricettaRow.quantita = 1;
        this.ricettaRigaSave();
      }
    });
  }

  updateIngredienteOrdinamento(ev: any) {
    // console.log('Dragged from index', ev.detail.from, 'to', ev.detail.to);
    // console.log(this.ricetta.ingredientiList);
    ev.detail.complete();

    this.gs.callGateway('3mCyL/kBibh2lxoVmwfXrDPeU5rjJJ7fj0BElNWNGMktWy0tSVYtWy2QzxShP4q87m0hlQWrr6NcMc9AyewbbxiMqrPsK6c0Lg@@',
        `${this.ricetta.ingredientiList[ev.detail.from].id},${ev.detail.to+1},${this.ricetta.cod_p}`).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this.gs.loading.dismiss();
          this._clearAndFocus();
        },
        error => this.gs.toast.present(error.message));
  }

    private _clearAndFocus() {
        this.ricettaRow.nome = '';
        this.ricettaRow.quantita = undefined;
        this.ricettaRow.ricettaid = 0;
        setTimeout(() => {
          this.nomeIngrediente.setFocus();
        },150);
    }

    pubblicaImmagine(event) {
      this.ricetta.file = event.target.files[0];
      /*if (this.ricetta.file.size > 1000000) {
          this.gs.toast.present('L\'immagine non può superare 1 MB di peso !');
          return;
      }*/
      if (this.ricetta.file) {
          const reader = new FileReader();
          reader.onload = this._handleReaderLoaded.bind(this);
          reader.readAsBinaryString(this.ricetta.file);
      }
    }

    _handleReaderLoaded(readerEvt) {
        const binaryString = readerEvt.target.result;
        this.ricetta.base64textString = btoa(binaryString);
        const dropboxObject = {
            mode: 1,
            path: 'ricette/',
            id: this.ricetta.cod_p,
            name: this.ricetta.file.name,
            type: this.ricetta.file.type,
            data: `data:image/${this.ricetta.file.type.indexOf('png') >-1 ? 'png' : 'jpeg'};base64,${this.ricetta.base64textString}`
        };
        this._ds.upload(dropboxObject).subscribe(data => {
            this.getRicetta(true);
        },error => this.gs.toast.present(error.message));
    }

    print() {
      if (this.ricetta.ricetteComposteList.length > 0) {
          window.open(environment.apiReportRicetta + "?gest=3&type=1&process=" + encodeURIComponent("3K2t3jzxjc+0a0dmj+eRVnotvAfJAoDjYQ/o8SAF2/wtWy0tSVYtWy15LcFBExarLwaeb6649Zrl8Rdbv9FDSmJwaBBc8C3e8g@@") +
              "&params="+this.ricetta.cod_p+"&token="+localStorage.getItem("token")+"&report=ricetta.html",
              "_blank");
      } else {
          window.open(environment.apiDBox + "?gest=3&type=1&process=" + encodeURIComponent("3K2t3jzxjc+0a0dmj+eRVnotvAfJAoDjYQ/o8SAF2/wtWy0tSVYtWy15LcFBExarLwaeb6649Zrl8Rdbv9FDSmJwaBBc8C3e8g@@") +
              "&params="+this.ricetta.cod_p+"&token="+localStorage.getItem("token")+"&report=ricetta.xml",
              "_blank");
      }
    }

}


