import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {GlobalService} from "../core/services/global.service";
import {ModalService} from "../core/services/modal.service";
import {DropboxService} from "../core/services/dropbox.service";
import {AlertService} from "../core/services/alert.service";

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
        documentiList: []
    };

    ngOnInit() {
        const param = this._route.snapshot.paramMap.get('id');
        if (param) {
            this.ricerca.codiceCategoria = param;
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
        console.log('Dragged from index', ev.detail.from, 'to', ev.detail.to);
        console.log(this.ricerca.documentiList);
        ev.detail.complete();

        /*this.gs.callGateway('2H6fgL8RL3pOrFGxXCopTYpWYOhLkBlwYhnnhWceTe4tWy0tSVYtWy1fTzDMAyCc1Um89Bg3UOXRiuG1dWW+NMqxJksng9UkOg@@',
            `${this.ricetta.ingredientiList[ev.detail.from].id},${ev.detail.to+1},${this.ricetta.cod_p}`).subscribe(data => {
              if (data.hasOwnProperty('error')) {
                this.gs.toast.present(data.error);
                return;
              }
              this.gs.loading.dismiss();
              this._clearAndFocus();
            },
            error => this.gs.toast.present(error.message));*/
    }

    nuovoFile() {

    }

    download($event, file: any) {

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
