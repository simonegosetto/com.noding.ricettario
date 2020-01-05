import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FoodcostPage } from './foodcost.page';

const routes: Routes = [
  {
    path: '',
    component: FoodcostPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FoodcostPageRoutingModule {}
