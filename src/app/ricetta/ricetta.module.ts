import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RicettaPageRoutingModule } from './ricetta-routing.module';

import { RicettaPage } from './ricetta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RicettaPageRoutingModule
  ],
  declarations: [RicettaPage]
})
export class RicettaPageModule {}
