import {AfterViewInit, Component} from '@angular/core';
import {ModalService} from "../core/services/modal.service";
import {NavParams} from "@ionic/angular";
import {Categoria} from "../shared/interface/categoria";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
    selector: 'app-modal-search.ricetta',
    template: `
        <ion-header>
            <ion-toolbar>
                <ion-title class="ion-text-center">{{ingredienteForm?.value?.descrizione}}</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
            <form [formGroup]="ingredienteForm" *ngIf="ingredienteForm" >
                <ion-card>
                    <ion-input type="hidden" formControlName="id" readonly></ion-input>
                    <ion-item>
                        <ion-label position="fixed">Nome</ion-label>
                        <ion-input type="text" formControlName="descrizione" ></ion-input>
                    </ion-item>
                    <ion-item>
                        <ion-label position="fixed">Scarto (%)</ion-label>
                        <ion-input type="number" formControlName="scarto" ></ion-input>
                    </ion-item>
                    <ion-item>
                        <ion-label position="fixed">Peso (g)</ion-label>
                        <ion-input type="number" formControlName="grammatura" ></ion-input>
                    </ion-item>
                    <ion-item>
                        <ion-label position="fixed">Prezzo (€)</ion-label>
                        <ion-input type="number" formControlName="prezzo"></ion-input>
                    </ion-item>
                    <ion-item>
                        <ion-label position="fixed">Calorie (kcal x 100g)</ion-label>
                        <ion-input type="number" formControlName="kcal"></ion-input>
                    </ion-item>
                    <ion-item>
                        <ion-label position="fixed">Categoria</ion-label>
                        <select formControlName="categoriaid" style="width: 100%" >
                            <option *ngFor="let categoria of categorieList" [ngValue]="categoria.id">{{categoria.descrizione}}</option>
                        </select>
                    </ion-item>
                    <ion-item>
                        <ion-label position="fixed">Provenienza</ion-label>
                        <ion-input type="text" formControlName="provenienza" ></ion-input>
                    </ion-item>
                    
                </ion-card>
            </form>
        </ion-content>

        <ion-footer>
            <ion-row>
                <ion-col>
                    <ion-button class="button-block" color="secondary" (click)="esci()">Annulla</ion-button>
                </ion-col>
                <ion-col>
                    <ion-button class="button-block" (click)="salva()">Salva</ion-button>
                </ion-col>
            </ion-row>
        </ion-footer>
    `,
    styles: []
})
export class ModalEditIngredienteListinoComponent implements AfterViewInit {

    constructor(
        public modal: ModalService,
        private _params: NavParams,
        private _fb: FormBuilder,
    ) {
    }

    public categorieList: Categoria[] = [];
    public ingredienteForm: FormGroup;

    ngAfterViewInit() {
        this.ingredienteForm = this._fb.group({
            id: [0, Validators.compose([Validators.required])],
            descrizione: [null, Validators.compose([Validators.maxLength(200), Validators.required])],
            scarto: [null, Validators.compose([Validators.max(100),Validators.min(0)])],
            grammatura: [null, Validators.compose([])],
            prezzo: [null, Validators.compose([])],
            categoriaid: [null, Validators.compose([])],
            kcal: [null, Validators.compose([])],
            provenienza: [null, Validators.compose([Validators.maxLength(200)])],
        });
        this.ingredienteForm.patchValue({...this._params.data});
        this.categorieList = [...this._params.data.categorieList];
    }

    salva() {
        this.modal.dismiss(this.ingredienteForm.value);
    }

    esci() {
        this.modal.dismiss(undefined);
    }

}
