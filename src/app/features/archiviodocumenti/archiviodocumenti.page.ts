import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {GlobalService} from "../core/services/global.service";
import {ModalCaricaFileComponent} from "./modal-carica-file.component";
import {ModalService} from "../core/services/modal.service";
import {AlertService} from "../core/services/alert.service";
import {ArchivioFile} from "../shared/interface/archivio-file";
import {ModalDescrizioneComponent} from "../shared/modal/modal-descrizione.component";
import {ModalConfig} from "../core/interfaces/modal-config";
import {DropboxService} from "../core/services/dropbox.service";
import {ModalArchivioFolderComponent} from "./modal-archivio-folder.component";

@Component({
    selector: 'ric-archiviodocumenti',
    templateUrl: './archiviodocumenti.page.html',
    styleUrls: ['./archiviodocumenti.page.scss'],
})
export class ArchiviodocumentiPage implements OnInit {

    constructor(
        private _router: Router,
        public gs: GlobalService,
        private _modal: ModalService,
        private _alert: AlertService,
        private _ds: DropboxService,
    ) { }

    public ricerca = {
        folderid: 0,
        folderName: undefined,
        parentid: 0,
        parentName: undefined,
        searchText: '',
        pageSize: 10,
        progressSize: 10,
        fileFolderList: [] as ArchivioFile[]
    };

    ngOnInit() {
        this.estrazioneFileFolder();
    }

    estrazioneFileFolder(event = null) {
        this.gs.callGateway('0i2+RmInGMX0DvOaBMb2+YgiKEYyPyb1UckrhmUoRUotWy0tSVYtWy0xLsiHvQYzJJ7lAyA1aGtvSXKul9MHKkoycGAVlT+pvg@@',
            `${this.ricerca.folderid},@foldername,@parentid,@parentname`).subscribe(data => {
                if (data.hasOwnProperty('error')) {
                    this.gs.toast.present(data.error);
                    return;
                }
                this.ricerca.fileFolderList = data.recordset ? [...data.recordset] : [];
                this.ricerca.folderName = data.output[0].foldername;
                this.ricerca.parentid = data.output[0].parentid;
                this.ricerca.parentName = data.output[0].parentname;
                if (event) {
                    event.target.complete();
                }
                this.gs.loading.dismiss();
            },
            error => this.gs.toast.present(error.message, 5000));
    }

    nuovoFile() {
        const modalCliente = this._modal.present(ModalCaricaFileComponent, {folderid: this.ricerca.folderid});
        modalCliente.then(result => {
            if (result.data) {
                this.estrazioneFileFolder();
            }
        });
    }

    nuovoCartella() {
        const modalNew = this._modal.present(ModalDescrizioneComponent, {
            title: 'Nuova Cartella',
            cancelText: 'Annulla',
            confirmText: 'Salva',
            data: {}
        } as ModalConfig);
        modalNew.then(result => {
            if (result.data && result.data.descrizione) {
                const {descrizione} = result.data;
                this.gs.callGateway('dNJI9LXEVkvhVA0PaJtwD6L1q6tfA1ZXsaZMJyuxlAUtWy0tSVYtWy1nspxg4PgQPJXIYQsxTVgBw9NiqJFN6hL09UIyi0ejrQ@@',
                    `'${descrizione}',${this.ricerca.folderid}`).subscribe(data => {
                        if (data.hasOwnProperty('error')) {
                            this.gs.toast.present(data.error);
                            return;
                        }
                        this.estrazioneFileFolder();
                        this.gs.loading.dismiss();
                    },
                    error => this.gs.toast.present(error.message, 5000));
            }
        });
    }

    deleteFolder($event, fileFolder: ArchivioFile) {
        $event.stopPropagation();
        const alertElimina = this._alert.confirm('Attenzione', `Confermi di eliminare della cartella "${fileFolder.descrizione}" e TUTTO quello che contiene ?`);
        alertElimina.then(result => {
            if (result.role === 'OK') {
                this.gs.callGateway('2ymowsy6h5RjmGLLwyCnmec4Xg5+Q3awNSSt6FXHz0ctWy0tSVYtWy3STQS3Onw2HQ6AGQvD8UN22C/Fwfi5L0YoEcLLJhH7+Q@@', `${fileFolder.folderid}`).subscribe(data => {
                        if (data.hasOwnProperty('error')) {
                            this.gs.toast.present(data.error);
                            return;
                        }
                        this.estrazioneFileFolder();
                        this.gs.loading.dismiss();
                    },
                    error => this.gs.toast.present(error.message));
            }
        });
    }

    deleteFile($event, fileFolder: ArchivioFile) {
        $event.stopPropagation();
        const alertElimina = this._alert.confirm('Attenzione', `Confermi di eliminare il file "${fileFolder.descrizione}" ?`);
        alertElimina.then(result => {
            if (result.role === 'OK') {
                this.gs.callGateway('2H6fgL8RL3pOrFGxXCopTYpWYOhLkBlwYhnnhWceTe4tWy0tSVYtWy1fTzDMAyCc1Um89Bg3UOXRiuG1dWW+NMqxJksng9UkOg@@', fileFolder.arc_codi).subscribe(data => {
                        if (data.hasOwnProperty('error')) {
                            this.gs.toast.present(data.error);
                            return;
                        }
                        this._ds.delete({mode: 3, path: fileFolder.id_storage}).subscribe(data => { }, error => this.gs.toast.present(error.message));
                        this.estrazioneFileFolder();
                        this.gs.loading.dismiss();
                    },
                    error => this.gs.toast.present(error.message, 5000));
            }
        });
    }

    edit($event, fileFolder: ArchivioFile) {
        $event.stopPropagation();
        const modalNew = this._modal.present(ModalDescrizioneComponent, {
            title: 'Modifica Cartella',
            cancelText: 'Annulla',
            confirmText: 'Salva',
            data: {...fileFolder}
        } as ModalConfig);
        modalNew.then(result => {
            if (result.data && result.data.descrizione) {
                const {folderid, descrizione} = result.data;
                this.updateFolderName({folderid, descrizione} as ArchivioFile);
            }
        });
    }

    move($event, file: ArchivioFile) {
        $event.stopPropagation();
        const modalFolder = this._modal.present(ModalArchivioFolderComponent, {});
        modalFolder.then(result => {
            if (result.data) {
                this.gs.callGateway('wVp8CePj9GWqbn4+9PSPrfcnBgJy5X6770MUTmuu8VEtWy0tSVYtWy2811ekJtlErGybjvOQXCisQNJvW7NZXC65kgNNldAyog@@',
                    `${file.arc_codi},${result.data.id}`).subscribe(data => {
                    if (data.hasOwnProperty('error')) {
                        this.gs.toast.present(data.error);
                        return;
                    }
                    this.estrazioneFileFolder();
                    this.gs.loading.dismiss();
                }, error => this.gs.toast.present(error.message));
            }
        });
    }

    updateFolderName(folder: ArchivioFile) {
        this.gs.callGateway('EO8JC8YQlb1qMkXVspBpN0TSg51g6MJE8AgoukLdy0stWy0tSVYtWy2+vCVIYV+sszqVEKfxn6c9KFZM1vtSrQBhvXMBKxU5iw@@',
            `${folder.folderid},'${folder.descrizione}'`).subscribe(data => {
                if (data.hasOwnProperty('error')) {
                    this.gs.toast.present(data.error);
                    return;
                }
                this.estrazioneFileFolder();
                this.gs.loading.dismiss();
            }, error => this.gs.toast.present(error.message));
    }

    open(folder: ArchivioFile) {
        if (folder.icon === 'folder') {
            this.ricerca.folderid = folder.folderid;
            this.estrazioneFileFolder();
        }
    }

    download($event, file: any) {
        $event.stopPropagation();
        this._ds.get({mode: 4, path: file.id_storage}).subscribe(file => {
            window.open(file.link, "_blank");
        }, error => this.gs.toast.present(error.message));
    }

    back() {
        this.ricerca.folderid = this.ricerca.parentid;
        this.estrazioneFileFolder();
    }

}
