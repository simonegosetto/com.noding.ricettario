import { Component, OnInit } from '@angular/core';
import {GlobalService} from "../core/services/global.service";
import {Router} from "@angular/router";
import {environment} from "../../environments/environment";
import {AlertService} from "../core/services/alert.service";
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'ric-ricette',
  templateUrl: './ricette.page.html',
  styleUrls: ['./ricette.page.scss'],
})
export class RicettePage implements OnInit {

  constructor(
      private _router: Router,
      private _alert: AlertService,
      public gs: GlobalService,
  ) { }

  public template = `<html><head><link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"></head><body><div class="container-fluid"> <div class="row"><div class="col-md-12 p-5 text-center"><h2>Aria Lampone</h2></div></div><div class="row"><div class="col-md-6"><h4>Ingredienti</h4><li class="row"><div class="col-md-6">Vino ridotto</div><div class="col-md-3">300g</div><div class="col-md-3">33%</div></li><li class="row"><div class="col-md-6">Vino ridotto</div><div class="col-md-3">300g</div><div class="col-md-3">33%</div></li><li class="row"><div class="col-md-6">Vino ridotto</div><div class="col-md-3">300g</div><div class="col-md-3">33%</div></li><li class="row"><div class="col-md-6">Vino ridotto</div><div class="col-md-3">300g</div><div class="col-md-3">33%</div></li><li class="row"><div class="col-md-6">Vino ridotto</div><div class="col-md-3">300g</div><div class="col-md-3">33%</div></li></div><div class="col-md-6"><img width="70%" src="data:image/jpeg;base64,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" ></div></div><div class="row"><div class="col-md-12 p-5"><h4>Procedimento</h4>Bollire il vino ridotto con i lamponi frullare e passare allo chinoix.Unire poi tutti gli ingredienti in un pentolino e portare a 60°C poi montare con il minipimer</div></div><div class="row"><div class="col-md-4 p-2"><div class="card" style="width: 100%;"> <img width="100%" src="https://ricetta.it/Uploads/Imgs/ricetta-tiramisu.jpg" class="card-img-top" > <div class="card-body"><h5 class="card-title">Ricetta 1</h5><li>Ingrediente 1</li><li>Ingrediente 2</li><li>Ingrediente 3</li><li>Ingrediente 4</li><p class="card-text">Some quick example text to build on the card title and make up the bulk of the card\'s content.</p></div></div></div><div class="col-md-4 p-2"><div class="card" style="width: 100%;"> <img width="100%" src="https://www.cucchiaio.it/content/cucchiaio/it/ricette/2019/07/cavolfiore-in-padella-con-pangrattato-e-acciughe/jcr:content/header-par/image-single.img10.jpg/1564495453642.jpg" class="card-img-top" > <div class="card-body"><h5 class="card-title">Ricetta 1</h5><li>Ingrediente 1</li><li>Ingrediente 2</li><li>Ingrediente 3</li><li>Ingrediente 3</li><li>Ingrediente 4</li><p class="card-text">Some quick example text to build on the card title and make up the bulk of the card\'s content.</p></div></div></div><div class="col-md-4 p-2"><div class="card" style="width: 100%;"> <img width="100%" src="https://ricetta.it/Uploads/Imgs/ricetta-tiramisu.jpg" class="card-img-top" > <div class="card-body"><h5 class="card-title">Ricetta 1</h5><li>Ingrediente 1</li><li>Ingrediente 4</li><p class="card-text">Some quick example text to build on the card title and make up the bulk of the card\'s content.</p></div></div></div><div class="col-md-4 p-2"><div class="card" style="width: 100%;"> <img width="100%" src="https://ricetta.it/Uploads/Imgs/ricetta-tiramisu.jpg" class="card-img-top" > <div class="card-body"><h5 class="card-title">Ricetta 1</h5><li>Ingrediente 1</li><li>Ingrediente 2</li><li>Ingrediente 3</li><li>Ingrediente 4</li><p class="card-text">Some quick example text to build on the card title and make up the bulk of the card\'s content.</p></div></div></div></div></div></body></html>`;
  public ricerca = {
    searchText: '',
    pageSize: 10,
    progressSize: 10,
    ricetteList: []
  };

  ngOnInit() {
    this.estrazioneRicette();
  }

  estrazioneRicette(event = null) {
    this.gs.callGateway('LTIPxL5qjowQfb/12AHQot46g9fczTHMoStuciq8lgEtWy0tSVYtWy3EIrwqBu/HHPPx2OwlvV5lj+BlS3Aoc5ax+VAEzrSFsw@@',``).subscribe(data => {
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
      window.open(environment.apiDBox + "?gest=3&type=1&process=" + encodeURIComponent("3K2t3jzxjc+0a0dmj+eRVnotvAfJAoDjYQ/o8SAF2/wtWy0tSVYtWy15LcFBExarLwaeb6649Zrl8Rdbv9FDSmJwaBBc8C3e8g@@") +
          "&params="+ricetta.cod_p+"&token="+localStorage.getItem("token")+"&report=ricetta.xml",
          "_blank");
    }
  }

  printRicetta2($event, ricetta:any) {
      $event.stopPropagation();
      /*if (ricetta != null) {
          window.open(environment.apiReport + "?gest=3&type=1&process=" + encodeURIComponent("3K2t3jzxjc+0a0dmj+eRVnotvAfJAoDjYQ/o8SAF2/wtWy0tSVYtWy15LcFBExarLwaeb6649Zrl8Rdbv9FDSmJwaBBc8C3e8g@@") +
              "&params="+ricetta.cod_p+"&token="+localStorage.getItem("token")+"&report=ricetta.html",
              "_blank");
      }*/

      html2canvas(document.getElementById('template'))
            .then(canvas => {
                const img = canvas.toDataURL('image/png');
                const doc = new jsPDF();
                doc.addImage(img, 0, 0);
                doc.save('Test.pdf');
            });
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
