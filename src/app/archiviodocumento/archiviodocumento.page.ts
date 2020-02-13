import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {GlobalService} from "../core/services/global.service";
import {ModalService} from "../core/services/modal.service";
import {DropboxService} from "../core/services/dropbox.service";
import {AlertService} from "../core/services/alert.service";
import {ModalCaricaFileComponent} from "./modal-carica-file.component";

@Component({
    selector: 'ric-archiviodocumento',
    templateUrl: './archiviodocumento.page.html',
    styleUrls: ['./archiviodocumento.page.scss'],
})
export class ArchiviodocumentoPage implements OnInit {

    constructor(
        private _router: Router,
        private _route: ActivatedRoute,
        public gs: GlobalService,
        private _alert: AlertService,
        private _modal: ModalService,
        private _ds: DropboxService,
    ) {
    }

    public ricerca = {
        searchText: '',
        pageSize: 10,
        progressSize: 10,
        codiceCategoria: '',
        descrizioneCategoria: '',
        documentiList: []
    };

    ngOnInit() {
        const param = this._route.snapshot.paramMap.get('id');
        if (param) {
            this.ricerca.codiceCategoria = param;
            this.ricerca.descrizioneCategoria = sessionStorage.getItem('descrizioneCategoria');
            this.estrazioneDocumenti();
        }
    }

    estrazioneDocumenti(event = null) {
        this.gs.callGateway('s9JttgAbpT+Nedz5f+MiQ5zKhoH2dtI61JYUvuVg9totWy0tSVYtWy2EJgQN5uly525UGJaTE2qndf7w2qWWqE9r01QAisHRNQ@@', `'${this.ricerca.codiceCategoria}'`).subscribe(data => {
                if (data.hasOwnProperty('error')) {
                    this.gs.toast.present(data.error);
                    return;
                }
                this.ricerca.documentiList = data.recordset ? [...data.recordset] : [];
                if (event) {
                    event.target.complete();
                }
                this.gs.loading.dismiss();
            },
            error => this.gs.toast.present(error.message, 5000));
    }

    updateFileOrdinamento(ev: any) {
        // console.log('Dragged from index', ev.detail.from, 'to', ev.detail.to);
        ev.detail.complete();

        this.gs.callGateway('BQuK1LQg1K1++H0R/llVW5VK2rjpxhAOceDnHZvLp7wtWy0tSVYtWy2hg/4BRkQV74v335KWniLlITaXsGO194qC1y/y5nhAiA@@',
            `${this.ricerca.documentiList[ev.detail.from].arc_codi},${ev.detail.to+1}`).subscribe(data => {
              if (data.hasOwnProperty('error')) {
                this.gs.toast.present(data.error);
                return;
              }
              this.gs.loading.dismiss();
            },
            error => this.gs.toast.present(error.message));
    }

    nuovoFile() {
        const modalCliente = this._modal.present(ModalCaricaFileComponent, {});
        modalCliente.then(result => {
            this.estrazioneDocumenti();
        });
    }

    download($event, file: any) {
        $event.stopPropagation();
        this._ds.get({mode: 4, path: file.id_storage}).subscribe(file => {
            window.open(file.link, "_blank");
        }, error => this.gs.toast.present(error.message));
    }

    delete($event, file: any) {
        $event.stopPropagation();
        const alertElimina = this._alert.confirm('Attenzione', `Confermi di eliminare il file ?`);
        alertElimina.then(result => {
            if (result.role === 'OK') {
                this.gs.callGateway('2H6fgL8RL3pOrFGxXCopTYpWYOhLkBlwYhnnhWceTe4tWy0tSVYtWy1fTzDMAyCc1Um89Bg3UOXRiuG1dWW+NMqxJksng9UkOg@@', file.arc_codi).subscribe(data => {
                        if (data.hasOwnProperty('error')) {
                            this.gs.toast.present(data.error);
                            return;
                        }
                        this._ds.delete({mode: 3, path: file.id_storage}).subscribe(data => { }, error => this.gs.toast.present(error.message));
                        this.estrazioneDocumenti();
                        this.gs.loading.dismiss();
                    },
                    error => this.gs.toast.present(error.message, 5000)
                );
            }
        });
    }

}
