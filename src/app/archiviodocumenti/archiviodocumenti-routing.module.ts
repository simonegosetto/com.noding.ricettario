import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ArchiviodocumentiPage } from './archiviodocumenti.page';

const routes: Routes = [
  {
    path: '',
    component: ArchiviodocumentiPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ArchiviodocumentiPageRoutingModule {}
