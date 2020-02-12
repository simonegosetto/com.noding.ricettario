import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ArchiviodocumentoPage } from './archiviodocumento.page';

const routes: Routes = [
  {
    path: '',
    component: ArchiviodocumentoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ArchiviodocumentoPageRoutingModule {}
