import {Component, OnInit} from '@angular/core';
import {GlobalService} from '../core/services/global.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Menu} from '../shared/interface/menu';
import {environment} from '../../environments/environment';
import {ListinoRead} from '../shared/interface/listino';

@Component({
    selector: 'ric-menu',
    templateUrl: './menu.page.html',
    styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {

    constructor(
        public gs: GlobalService,
        private _route: ActivatedRoute,
        private _router: Router
    ) {
    }

    public menu: Menu = {} as Menu;
    public listiniList: ListinoRead[] = [];
    public listinoID: number;

    ngOnInit() {
        const param = this._route.snapshot.paramMap.get('id');
        if (parseInt(param) > 0) {
            this.menu.id = parseInt(param);
            this._estrazioneListini();
            this.getMenu();
        } else {
            this.menu.id = 0;
        }
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
                }
                this.gs.loading.dismiss();
            },
            error => this.gs.toast.present(error.message));
    }

    public getMenu() {
        this.gs.callGateway('K3JkUG7Hy1/chWxotpmDKn1FOCiRcA9/dx2Fu6QMRL8tWy0tSVYtWy1uvOoRTQ4JicWvhMJMzdxojl+4bSC4yeD1RFwsdpoPJg@@', `${this.menu.id}`).subscribe(data => {
                if (data.hasOwnProperty('error')) {
                    this.gs.toast.present(data.error);
                    return;
                }
                this.menu = {...data.recordset[0]};
                this.gs.loading.dismiss();
            },
            error => this.gs.toast.present(error.message));
    }

    public print(param: string) {
        window.open((this.menu.tipo === 1 ? environment.apiReportMenuAllaCarta : environment.apiReportMenuEvento)
            + '?menu=' + this.menu.id
            + '&listino=' + this.listinoID
            + param
            + '&descrizione=' + encodeURIComponent(this.menu.descrizione)
            + '&token=' + localStorage.getItem('token'), '_blank');
    }

    navToRicetta(cod_p: number) {
        this._router.navigate([`ricetta/${cod_p}`]);
    }

}
