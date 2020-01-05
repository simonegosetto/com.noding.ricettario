import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RicettePageRoutingModule } from './ricette-routing.module';

import { RicettePage } from './ricette.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RicettePageRoutingModule
  ],
  declarations: [RicettePage]
})
export class RicettePageModule {}
