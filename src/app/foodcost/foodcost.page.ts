import { Component, OnInit } from '@angular/core';
import {GlobalService} from "../core/services/global.service";

@Component({
  selector: 'ric-foodcost',
  templateUrl: './foodcost.page.html',
  styleUrls: ['./foodcost.page.scss'],
})
export class FoodcostPage implements OnInit {

  constructor(
      public  gs: GlobalService
  ) { }

  public ricerca = {
    tutte: true,
    searchText: '',
    pageSize: 10,
    progressSize: 10,
    alimentiList: [],
    alimentiFullList: []
  };

  ngOnInit() {
    this.estrazioneAlimenti();
  }

  estrazioneAlimenti() {
    this.ricerca.pageSize = 10;
    this.ricerca.progressSize = 10;
    this.gs.callGateway('PZ1+HZdXNvLpU0AZIUk3rWpubGUzhymuevOJS2VGErUtWy0tSVYtWy0iUErMQX3OPVw/8cT4xk1K8L8Bc9Hoq4rbP3xl4f+TOg@@',``).subscribe(data => {
          if (data.hasOwnProperty('error')) {
            this.gs.toast.present(data.error);
            return;
          }
          this.ricerca.alimentiFullList = data.recordset ? [...data.recordset] : [];
          if (this.ricerca.alimentiFullList.length > 0 && this.ricerca.alimentiFullList.length > this.ricerca.pageSize) {
            const [a, b, c, d, e, f, g, h, i, l] = this.ricerca.alimentiFullList;
            this.ricerca.alimentiList = [a, b, c, d, e, f, g, h, i, l];
          } else {
            this.ricerca.alimentiList = [...this.ricerca.alimentiFullList];
          }
          this.gs.loading.dismiss();
        },
        error => this.gs.toast.present(error.message, 5000));
  }

  loadData(event) {
    setTimeout(() => {
      const {pageSize, progressSize} = this.ricerca;
      const deltaList = this.ricerca.alimentiFullList
          .map((item, index) => {
            if (index >= progressSize && index < (progressSize + pageSize)) {
              return item;
            }
          })
          .filter(d => d !== undefined);
      console.log('delta', deltaList);
      this.ricerca.alimentiList = [...this.ricerca.alimentiList, ...deltaList];
      this.ricerca.progressSize += pageSize;
      event.target.complete();

      if (this.ricerca.alimentiFullList.length === this.ricerca.alimentiList.length) {
        event.target.disabled = true;
      }
    }, 100);
  }
}
