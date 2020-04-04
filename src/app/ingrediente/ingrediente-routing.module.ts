import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IngredientePage } from './ingrediente.page';

const routes: Routes = [
  {
    path: '',
    component: IngredientePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IngredientePageRoutingModule {}
