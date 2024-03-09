import {Component, OnInit} from '@angular/core';
import {GlobalService} from '../core/services/global.service';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from '../../environments/environment';
import {AlertService} from '../core/services/alert.service';

@Component({
    selector: 'ric-ricette',
    templateUrl: './ricette.page.html',
    styleUrls: ['./ricette.page.scss'],
})
export class RicettePage implements OnInit {

    constructor(
        private _router: Router,
        private _alert: AlertService,
        private _route: ActivatedRoute,
        public gs: GlobalService,
    ) {
    }

    public ricerca = {
        searchText: '',
        tipo: 1,
        pageSize: 10,
        progressSize: 10,
        ricetteList: []
    };

    ngOnInit() {
        const tipo: string = this._route.snapshot.paramMap.get('tipo');
        if (tipo) {
            this.ricerca.tipo = parseInt(tipo, 10);
        }
        this.estrazioneRicette();
    }

    estrazioneRicette(event = null) {
        this.gs.callGateway('uZ+/JDG/PtCiDhrc9YiYjA7p3tmqsWYz8VP7y8teKAUtWy0tSVYtWy3Wbn4vVzxB2eEOOUDqUe1WQxdC6MGkch0xB7XUzRjtKA@@', `${this.ricerca.tipo}`).subscribe(data => {
                if (data.hasOwnProperty('error')) {
                    this.gs.toast.present(data.error);
                    return;
                }
                this.ricerca.ricetteList = data.recordset ? [...data.recordset] : [];
                if (event) {
                    event.target.complete();
                }
                this.gs.loading.dismiss();
            },
            error => this.gs.toast.present(error.message, 5000));
    }

    nuovaRicetta() {
        this._router.navigate(['ricetta/0']);
    }

    openRicetta(ricetta: any) {
        this._router.navigate([`ricetta/${ricetta.cod_p}`]);
    }

    printRicetta($event, ricetta: any) {
        $event.stopPropagation();
        if (ricetta != null) {
            window.open(environment.apiDBox + '?gest=3&type=1&process=' + encodeURIComponent('3K2t3jzxjc+0a0dmj+eRVnotvAfJAoDjYQ/o8SAF2/wtWy0tSVYtWy15LcFBExarLwaeb6649Zrl8Rdbv9FDSmJwaBBc8C3e8g@@') +
                '&params=' + ricetta.cod_p + '&token=' + localStorage.getItem('token') + '&report=ricetta.xml',
                '_blank');
        }
    }

    printRicetta2($event, ricetta: any) {
        $event.stopPropagation();
        if (ricetta != null) {
            window.open(environment.apiReportRicetta + '?gest=3&type=1&process=' + encodeURIComponent('3K2t3jzxjc+0a0dmj+eRVnotvAfJAoDjYQ/o8SAF2/wtWy0tSVYtWy15LcFBExarLwaeb6649Zrl8Rdbv9FDSmJwaBBc8C3e8g@@') +
                '&params=' + ricetta.cod_p + '&token=' + localStorage.getItem('token') + '&report=ricetta.html',
                '_blank');
        }
    }

    deleteRicetta($event, ricetta: any) {
        $event.stopPropagation();
        const alertElimina = this._alert.confirm('Attenzione', `Confermi di eliminare la ricetta ${ricetta.nome_ric} ?`);
        alertElimina.then(result => {
            if (result.role === 'OK') {
                this.gs.callGateway('bLOf0dGTa+GDJaEG232HA2DR7U2p+79ptLfo/nJDQXktWy0tSVYtWy33s2LNhx4WwU+524qvbddJQUhdRkrjlIEXDYj5rB8vhQ@@', ricetta.cod_p).subscribe(data => {
                        if (data.hasOwnProperty('error')) {
                            this.gs.toast.present(data.error);
                            return;
                        }
                        this.estrazioneRicette();
                        this.gs.loading.dismiss();
                    },
                    error => this.gs.toast.present(error.message, 5000)
                );
            }
        });
    }

}
