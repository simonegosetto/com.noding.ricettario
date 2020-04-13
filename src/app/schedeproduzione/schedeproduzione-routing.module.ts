import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SchedeproduzionePage } from './schedeproduzione.page';

const routes: Routes = [
  {
    path: '',
    component: SchedeproduzionePage
  },
  {
    path: 'schedaproduzione',
    loadChildren: () => import('./schedaproduzione.module').then( m => m.SchedaproduzionePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SchedeproduzionePageRoutingModule {}
