import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RicettePage } from './ricette.page';

const routes: Routes = [
  {
    path: '',
    component: RicettePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RicettePageRoutingModule {}
