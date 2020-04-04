import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {AlertService} from "../core/services/alert.service";
import {GlobalService} from "../core/services/global.service";
import {IngredienteRead} from "../shared/interface/ingrediente";
import {Categoria} from "../shared/interface/categoria";

@Component({
  selector: 'ric-ingredienti',
  templateUrl: './ingredienti.page.html',
  styleUrls: ['./ingredienti.page.scss'],
})
export class IngredientiPage implements OnInit {

  constructor(
      private _router: Router,
      private _alert: AlertService,
      public gs: GlobalService,
  ) { }

  public ricerca = {
    searchText: '',
    categoria:  0,
    pageSize: 10,
    progressSize: 10,
    categorieList: [] as Categoria[],
    ingredientiList: [] as IngredienteRead[]
  };

  ngOnInit() {
    this._estrazioneCategorie();
  }

  private _estrazioneCategorie() {
    this.gs.callGateway('gKAvUn6c5bcp110Jh/vcbsnEbwctvJY0zl6gC0K3qa4tWy0tSVYtWy1H1JD+sBUdce4kGbfi8PFOJ6glv1neuYU/19MzXKDDSQ@@',``).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this.ricerca.categorieList = data.recordset ? [...data.recordset] : [];
          this.gs.loading.dismiss();
          this.estrazioneIngredienti();
        },
        error => this.gs.toast.present(error.message, 5000));
  }

  estrazioneIngredienti(event = null) {
    this.gs.callGateway('bbtabTidV8KEsNAoPoPsMZrWPje9HWFF1SI8UJfFcG4tWy0tSVYtWy2ieb2SxK2ILBtxHAZtjBp9STuLcZUq1Pwpaqe1hyF76w@@',`${this.ricerca.categoria}`).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this.ricerca.ingredientiList = data.recordset ? [...data.recordset] : [];
          if (event) {
            event.target.complete();
          }
          this.gs.loading.dismiss();
        },
        error => this.gs.toast.present(error.message, 5000));
  }

  openIngrediente(ingrediente: IngredienteRead) {
    this._router.navigate([`ingrediente/${ingrediente.id}`]);
  }

  deleteIngrediente($event, ingrediente: IngredienteRead) {
    $event.stopPropagation();
    const alertElimina = this._alert.confirm('Attenzione', `Confermi di eliminare l'ingrediente ${ingrediente.descrizione} ?`);
    alertElimina.then(result => {
      if (result.role === 'OK') {
        this.gs.callGateway('p2d+TtQ/dQOo4lJPz++h1MRy/cZFAyDChrRR1bKDq2stWy0tSVYtWy1NLLIeWnBCUKFPaisS3RfePOHe7IdtCl/t+HVm5Is6jg@@', ingrediente.id).subscribe(data => {
              if (data.hasOwnProperty('error')) {
                this.gs.toast.present(data.error);
                return;
              }
              this.estrazioneIngredienti();
              this.gs.loading.dismiss();
            },
            error => this.gs.toast.present(error.message, 5000)
        );
      }
    });
  }
}
