import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {GlobalService} from "../core/services/global.service";
import {IngredienteFoodcostRead} from "../shared/interface/ingrediente-foodcost";
import {ListinoRead} from "../shared/interface/listino";
import {Observable} from "rxjs";

@Component({
    selector: 'ric-ricetta-foodcost',
    templateUrl: './ricetta-foodcost.component.html',
    styles: [`
        .totali > ion-col {
            font-weight: bold;
        }

        @media (max-width: 767px) {
            ion-col {
                font-size: smaller;
            }
        }
    `]
})
export class RicettaFoodcostComponent implements OnInit {

    constructor(
        public gs: GlobalService,
    ) {
    }

    @Input() cod_p: number;
    @Input() doRefresh: Observable<any>;
    @Output() prezzoUpdate = new EventEmitter();
    @Output() pesoUpdate = new EventEmitter();
    @Output() listinoChange = new EventEmitter();

    public ingredientiFoodcostList: IngredienteFoodcostRead[] = [];
    public listinoID: number;
    public listiniList: ListinoRead[] = [];
    public totali = {
        peso: 0,
        foodcost: 0,
        kcal: 0,
        pesoEffettivo: 0,
        prezzoVenditaLordo: 0,
        ratio: 0,
        prezzoVenditaNetto: 0,
        margineNetto: 0
    };

    ngOnInit() {
        this.doRefresh.subscribe(_ => {
            this.getFoodcost();
        });
        this._estrazioneListini();
    }

    private _estrazioneListini() {
        this.gs.callGateway('BnnFe0vU9aHbFGDCdwhl3h+5nSiRtsLXHgSRgQ803PAtWy0tSVYtWy3oQdVT2zI26QCrxbZr7SBgQ0QqM/cJWYN2qNm3Fq18Lw@@', ``).subscribe(data => {
                if (data.hasOwnProperty('error')) {
                    this.gs.toast.present(data.error);
                    return;
                }
                this.listiniList = data.recordset ? data.recordset : [];
                if (this.listiniList.length > 0) {
                    this.listinoID = this.listiniList[0].id;
                    this.listinoChange.emit(this.listinoID);
                    this.getFoodcost();
                }
                this.gs.loading.dismiss();
            },
            error => this.gs.toast.present(error.message));
    }

    getFoodcost() {
        this.gs.callGateway('LFC27QWysxqH1e4JTynZrvTHeDkIVVqZltWRciikjx8tWy0tSVYtWy3Km2VOTGisd/Rk3YKgL0fvR/aNOscBfJZfx6MapREbCg@@',
            `${this.cod_p},${this.listinoID}`).subscribe(data => {
                if (data.hasOwnProperty('error')) {
                    this.gs.toast.present(data.error);
                    return;
                }
                this.ingredientiFoodcostList = data.recordset ? data.recordset : [];
                this.getTotali();
                this.gs.loading.dismiss();
            },
            error => this.gs.toast.present(error.message));
    }

    getTotali() {
        this.gs.callGateway('qowr/0gbIcivI7tzuXF3CcuV980mPwzGQU+See/fYNMtWy0tSVYtWy3CP0PrzJ6X9m1jn4Z+ig0OxeCGFi2Pu2EwfFZDO7S8pw@@',
            `${this.cod_p},${this.listinoID}`).subscribe(data => {
                if (data.hasOwnProperty('error')) {
                    this.gs.toast.present(data.error);
                    return;
                }
                this.totali.peso = data.recordset[0].peso;
                this.totali.foodcost = data.recordset[0].foodcost;
                this.totali.kcal = data.recordset[0].kcal;
                this.totali.pesoEffettivo = data.recordset[0].peso_effettivo;
                this.totali.prezzoVenditaLordo = data.recordset[0].prezzo_lordo_vendita;
                this.totali.ratio = data.recordset[0].ratio;
                this.totali.prezzoVenditaNetto = data.recordset[0].prezzo_netto_vendita;
                this.totali.margineNetto = data.recordset[0].margine_netto;
                this.gs.loading.dismiss();
            },
            error => this.gs.toast.present(error.message));
    }

    aggiornaPrezzo() {
        this.prezzoUpdate.emit(this.totali.prezzoVenditaLordo);
    }

    aggiornaPeso() {
        this.pesoUpdate.emit(this.totali.pesoEffettivo);
    }

}
