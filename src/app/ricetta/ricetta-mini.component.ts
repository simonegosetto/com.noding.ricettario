import {ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {GlobalService} from "../core/services/global.service";
import {DropboxService} from "../core/services/dropbox.service";
import {Router} from "@angular/router";

@Component({
  selector: 'ric-ricetta-mini',
  templateUrl: './ricetta-mini.component.html',
  styleUrls: ['./ricetta-mini.component.scss'],
})
export class RicettaMiniComponent implements OnInit {

  constructor(
      public gs: GlobalService,
      private _ds: DropboxService,
      private _router: Router
  ) { }

  private _cod_p: number;
  @Input()
  set cod_p(_value: number) {
    this._cod_p = _value;
    this.getRicetta();
  }
  get cod_p(): number {
    return this._cod_p;
  }

  public ricetta: any = {
    ingredientiList: []
  };

  ngOnInit() {}

  getRicetta() {
    this.gs.callGateway('3K2t3jzxjc+0a0dmj+eRVnotvAfJAoDjYQ/o8SAF2/wtWy0tSVYtWy15LcFBExarLwaeb6649Zrl8Rdbv9FDSmJwaBBc8C3e8g@@',`${this.cod_p}`).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this.ricetta = {...this.ricetta, ...data.recordset[0]};
          if (this.ricetta.id_storage) {
            this._getRicettaImage();
          }
          this._estrazioneRighe();
          this.gs.loading.dismiss();
        },
        error => this.gs.toast.present(error.message));
  }

  private _getRicettaImage() {
    this._ds.get({mode: 4, path: this.ricetta.id_storage}).subscribe(image => {
      this.ricetta.image = image.link;
    }, error => this.gs.toast.present(error.message));
  }

  private _estrazioneRighe() {
    this.gs.callGateway('SK1mkQH9EPMbEjkXjVKh208J+h4RyoSZdYvjFW/IwVEtWy0tSVYtWy13aAC10tFq5lY4fyaPFRki0Z709DrH0ocLUEzAss/mUw@@',`${this.cod_p}`).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this.ricetta.ingredientiList = data.recordset ? [...data.recordset] : [];
          this.gs.loading.dismiss();
        },
        error => this.gs.toast.present(error.message));
  }

  public navToRicetta() {
    this._router.navigate([`ricetta/${this.cod_p}`]);
  }

}
