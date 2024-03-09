import { Component, OnInit } from '@angular/core';
import {Ingrediente} from "../shared/interface/ingrediente";
import {GlobalService} from "../core/services/global.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastService} from "../core/services/toast.service";
import {UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {Categoria} from "../shared/interface/categoria";
import {AlertService} from "../core/services/alert.service";

@Component({
  selector: 'ric-ingrediente',
  templateUrl: './ingrediente.page.html',
  styleUrls: ['./ingrediente.page.scss'],
})
export class IngredientePage implements OnInit {

  constructor(
      public gs: GlobalService,
      private _route: ActivatedRoute,
      private _toast: ToastService,
      private _fb: UntypedFormBuilder,
      private _alert: AlertService,
      private _router: Router,
  ) { }

  public ingrediente: Ingrediente = {} as Ingrediente;
  public categorieList: Categoria[] = [];
  public ingredienteForm: UntypedFormGroup;

  ngOnInit() {
    this.ingredienteForm = this._fb.group({
      id: [0, Validators.compose([Validators.required])],
      descrizione: [null, Validators.compose([Validators.maxLength(200), Validators.required])],
      edibile: [null, Validators.compose([Validators.max(100),Validators.min(0)])],
      grammatura: [null, Validators.compose([])],
      prezzo: [null, Validators.compose([])],
      categoriaid: [null, Validators.compose([])],
    });

    const param = this._route.snapshot.paramMap.get('id');
    if (parseInt(param) > 0) {
      this.ingrediente.id = parseInt(param);
      this.getIngrediente();
    } else {
      this.ingrediente.id = 0;
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

  getIngrediente() {
    this.gs.callGateway('Xi6OhhARL0fNZT5Tq+Qg3uoF6ChY6iHB91VJtsTVs/ktWy0tSVYtWy1Mfuu2V0WMGjQpeM9zBkJpuugHmYwMnKRy9NsLumRh6w@@',`${this.ingrediente.id}`).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this.ingredienteForm.patchValue({...data.recordset[0]});
          this.gs.loading.dismiss();
        },
        error => this.gs.toast.present(error.message));
  }

  salvaIngrediente() {
    if (this.ingredienteForm.dirty) {
      this.gs.callGateway('ITzKByQOl9B/+22hc38MCiKBFQZxsPHR8JLpjhC/y7stWy0tSVYtWy1GJjhVbvJZ6K1PoaNf4trjYP4fSLFScG6hQzPp6H23mQ@@',
      `${this.ingrediente.id},${this.ingredienteForm.controls['edibile'].value},${this.ingredienteForm.controls['grammatura'].value},${this.ingredienteForm.controls['prezzo'].value},${this.ingredienteForm.controls['categoriaid'].value}`
      ).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this.gs.loading.dismiss();
          this.gs.toast.present('Ingrediente salvato correttamente !');
        },
        error => this.gs.toast.present(error.message));
    }
  }

  delete() {
    const alertElimina = this._alert.confirm('Attenzione', `Confermi di eliminare l'ingrediente ${this.ingredienteForm.controls['descrizione'].value} ?`);
    alertElimina.then(result => {
      if (result.role === 'OK') {
        this.gs.callGateway('p2d+TtQ/dQOo4lJPz++h1MRy/cZFAyDChrRR1bKDq2stWy0tSVYtWy1NLLIeWnBCUKFPaisS3RfePOHe7IdtCl/t+HVm5Is6jg@@', this.ingrediente.id).subscribe(data => {
              if (data.hasOwnProperty('error')) {
                this.gs.toast.present(data.error);
                return;
              }
              this._router.navigate(['ingredienti']);
              this.gs.loading.dismiss();
            },
            error => this.gs.toast.present(error.message, 5000)
        );
      }
    });
  }

}
