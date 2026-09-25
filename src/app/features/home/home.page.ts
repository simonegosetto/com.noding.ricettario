import {Component} from '@angular/core';
import {Router} from "@angular/router";
import {GlobalService} from "../core/services/global.service";

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage {

    constructor(
        private _router: Router,
        public  gs: GlobalService
    ) {
    }

    public note = {
        testo: undefined
    };

    ionViewWillEnter(): void {
        this.getNote();
    }

    navTo(route: string) {
        this._router.navigate([route]);
    }

    getNote() {
        this.gs.callGateway('msttQNbHh0Nh4M6SPlL1E2RRjufluJl7u8nOT5uTFQgtWy0tSVYtWy3yLZRiLpj66qNH/MtAXyvG6/WGYN9/NpyiMKwIvniTyw@@', ``).subscribe(data => {
                if (data.hasOwnProperty('error')) {
                    this.gs.toast.present(data.error);
                    return;
                }
                this.note.testo = data.recordset[0].note;
                this.gs.loading.dismiss();
            },
            error => this.gs.toast.present(error.message, 5000));
    }

    updateNote() {
        this.gs.callGateway('7RRAJLmsoEjqi84dxQbF7Kh1ozVAN6ahXA5OQwcVj+QtWy0tSVYtWy05XrtZ0y+ZrhjMNlwudUA9OK4TsfluJj2y3GWPQbRPCA@@', `'${this.gs.isnull(this.note.testo)}'`).subscribe(data => {
                if (data.hasOwnProperty('error')) {
                    this.gs.toast.present(data.error);
                    return;
                }
                this.gs.toast.present('Note aggiornate correttamente !');
                this.gs.loading.dismiss();
            },
            error => this.gs.toast.present(error.message, 5000));
    }

}
