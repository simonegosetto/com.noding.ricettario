import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SchedaproduzionePage } from './schedaproduzione.page';

const routes: Routes = [
  {
    path: '',
    component: SchedaproduzionePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SchedaproduzionePageRoutingModule {}
