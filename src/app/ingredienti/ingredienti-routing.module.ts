import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IngredientiPage } from './ingredienti.page';

const routes: Routes = [
  {
    path: '',
    component: IngredientiPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IngredientiPageRoutingModule {}
