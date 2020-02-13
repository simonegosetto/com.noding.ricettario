import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SchedetecnichePage } from './schedetecniche.page';

const routes: Routes = [
  {
    path: '',
    component: SchedetecnichePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SchedetecnichePageRoutingModule {}
