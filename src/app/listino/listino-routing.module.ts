import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListinoPage } from './listino.page';

const routes: Routes = [
  {
    path: '',
    component: ListinoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListinoPageRoutingModule {}
