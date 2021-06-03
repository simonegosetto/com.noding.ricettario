import {AfterViewInit, Component, EventEmitter, Input, Output} from '@angular/core';
import {GlobalService} from '../core/services/global.service';
import {ModalService} from '../core/services/modal.service';
import {AlertService} from '../core/services/alert.service';
import {Menu, MenuRiga, MenuRigaSearch, MenuTotali} from '../shared/interface/menu';
import {ModalSearchRicettaMenuComponent} from './modal-search-ricetta-menu.component';

@Component({
    selector: 'ric-menu-evento',
    templateUrl: './menu-evento.component.html',
    styles: []
})
export class MenuEventoComponent implements AfterViewInit {

    constructor(
        public gs: GlobalService,
        private _modal: ModalService,
        private _alert: AlertService,
    ) {
    }

    private _listinoid: number;
    @Input() menu: Menu;
    @Input() // listinoid: number;
    // tslint:disable-next-line:variable-name
    set listinoid(_value: number) {
        if (_value) {
            this._listinoid = _value;
            this._estrazione();
        }
    }
    get listinoid(): number {
        return this._listinoid;
    }
    @Output() onRicettaClick = new EventEmitter();
    public menuRiga: MenuRiga = {} as MenuRiga;
    public righeList: MenuRigaSearch[] = [];
    public menuTotali: MenuTotali = {} as MenuTotali;

    ngAfterViewInit() {
        /*setTimeout(() => {
            this._estrazione();
        }, 10);*/
    }

    private _estrazione() {
        this.gs.callGateway('gmWVJZP+UGV9KGcRG53D30i0ozWILb/EMajQiDrIEastWy0tSVYtWy3BMu7OQxzscLI2Tq9rx7i26t6Ra97143uOpKI178zF1w@@', `${this.menu.id},${this.listinoid}`).subscribe(data => {
            if (data.hasOwnProperty('error')) {
                this.gs.toast.present(data.error);
                return;
            }
            this.righeList = data.recordset ? [...data.recordset] : [];
            this.totaliGet();
            this.gs.loading.dismiss();
        }, error => this.gs.toast.present(error.message, 5000));
    }

    searchRicetta() {
        const modalSearchRicetta = this._modal.present(ModalSearchRicettaMenuComponent, {});
        modalSearchRicetta.then(result => {
            if (result.data) {
                this.menuRiga.ricettaid = result.data.cod_p;
                this.menuRiga.nome_ric = result.data.nome_ric;
            }
        });
    }

    updateRicetteOrdinamento(ev: any) {
        ev.detail.complete();
        console.log('sposto codice', this.righeList[ev.detail.from].id, 'da', ev.detail.from + 1, 'a', ev.detail.to + 1);
        this.gs.callGateway('wQgcfZjoo4BsKUwn1t0+NbzoCkWck6mkuw/a9KY/nXpVZXHo0QuYVoGlQ7vNS2lxQXzp7HvVq3pM3+2UW0H3Vy1bLS1JVi1bLdUd42OAYsvyHLgHO9HEb2f4tL/vbUcenrRISZDDpJiS',
            `${this.righeList[ev.detail.from].id},${ev.detail.to + 1},${this.menu.id}`).subscribe(data => {
            if (data.hasOwnProperty('error')) {
                this.gs.toast.present(data.error);
                return;
            }
            this.gs.loading.dismiss();
        }, error => this.gs.toast.present(error.message));
    }

    insertSeparator($event, riga: MenuRigaSearch) {
        $event.stopPropagation();
        this.gs.callGateway('nvNvQc1GDrC4lRSoWH69eswNyldEoanRYJv4G/68vZMtWy0tSVYtWy0Y/+aKGhSOEdnrEoo8wv9Rl57gUsu4PSBzUN36HmUgBQ@@',
            `${riga.id},${this.menu.id}`).subscribe(data => {
            if (data.hasOwnProperty('error')) {
                this.gs.toast.present(data.error);
                return;
            }
            this._estrazione();
            this.gs.loading.dismiss();
        }, error => this.gs.toast.present(error.message, 5000));
    }

    deleteSeparator($event, riga: MenuRigaSearch) {
        $event.stopPropagation();
        const alertElimina = this._alert.confirm('Attenzione', `Confermi di eliminare il separatore ?`);
        alertElimina.then(result => {
            if (result.role === 'OK') {
                this.gs.callGateway('TSjQ4Ux8su/QtywQgqrzwWVeCYI2bozUYh64WUtMaYQtWy0tSVYtWy1fw6mgUpkDGe+PLDd01VCvb2K7SCePco+lVTA+rbxubg@@', riga.id).subscribe(data => {
                    if (data.hasOwnProperty('error')) {
                        this.gs.toast.present(data.error);
                        return;
                    }
                    this._estrazione();
                    this.gs.loading.dismiss();
                }, error => this.gs.toast.present(error.message, 5000));
            }
        });

    }

    delete($event, riga: MenuRigaSearch) {
        $event.stopPropagation();
        const alertElimina = this._alert.confirm('Attenzione', `Confermi di eliminare il piatto ${riga.descrizione} ?`);
        alertElimina.then(result => {
            if (result.role === 'OK') {
                this.gs.callGateway('ucPKP4vgLwFswQYd3kYSXH49AtOVNz6n57HE4QChZOAtWy0tSVYtWy1cBMOHmEBYZ5ahYrEc8UnPWdkZo4MLYEwx/AiyDiHvsw@@', riga.id).subscribe(data => {
                        if (data.hasOwnProperty('error')) {
                            this.gs.toast.present(data.error);
                            return;
                        }
                        this._estrazione();
                        this.gs.loading.dismiss();
                    }, error => this.gs.toast.present(error.message, 5000));
            }
        });
    }

    save() {
        if (
            this.gs.isnull(this.menuRiga.ricettaid, 0) == 0 ||
            this.gs.isnull(this.menu.id, 0) == 0
        ) {
            this.gs.toast.present('Campi obbligatori mancanti !');
            return;
        }

        this.gs.callGateway('4EKFMSLcQErqesydVFFs5MsgUMVAnsk6dEJL6HKiuJ4tWy0tSVYtWy3rWCf0m7d18zKWD0qTdpZ5nrElD4jbP/gbWu8yWlij+A@@',
            `${this.menu.id},${this.menuRiga.ricettaid},0`).subscribe(data => {
            if (data.hasOwnProperty('error')) {
                this.gs.toast.present(data.error);
                return;
            }
            this._estrazione();
            this.menuRiga.ricettaid = 0;
            this.menuRiga.nome_ric = '';
            this.menuRiga.id = 0;
            this.menuRiga.menucategoriaid = 0;
            this.gs.loading.dismiss();
        }, error => this.gs.toast.present(error.message, 5000));
    }

    aggiornaMenu() {
        this.gs.callGateway('fqSIBghvRnSQ3MgfxEa5hzSJrTnuUrl/KmoPJqpLVuotWy0tSVYtWy0bKOK/0/Gx2zq8WP1fh0DpzYkmaXcymyb9qV+FiPj+HQ@@',
            `${this.menu.id},${this.menu.pax},${this.menu.perc_ricetta}`).subscribe(data => {
            if (data.hasOwnProperty('error')) {
                this.gs.toast.present(data.error);
                return;
            }
            this.totaliGet();
            this.gs.loading.dismiss();
        }, error => this.gs.toast.present(error.message, 5000));
    }

    totaliGet() {
        this.gs.callGateway('AhzhmjtF+z/CNSybI+oPMsvY8bgo02n2+Kccc5ifI44tWy0tSVYtWy2A3OleBbhIztblymLHcptfGLTotAqZ5MFdbdj4eyjhaA@@',
            `${this.menu.id},${this.listinoid}`).subscribe(data => {
            if (data.hasOwnProperty('error')) {
                this.gs.toast.present(data.error);
                return;
            }
            this.menuTotali = {...data.recordset[0]};
            this.gs.loading.dismiss();
        }, error => this.gs.toast.present(error.message, 5000));
    }

}
