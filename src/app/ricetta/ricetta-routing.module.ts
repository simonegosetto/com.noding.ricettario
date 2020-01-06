import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RicettaPage } from './ricetta.page';

const routes: Routes = [
  {
    path: '',
    component: RicettaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RicettaPageRoutingModule {}
