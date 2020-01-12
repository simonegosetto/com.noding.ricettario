import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RicettaPageRoutingModule } from './ricetta-routing.module';

import { RicettaPage } from './ricetta.page';
import {RicettaMiniModule} from "./ricetta-mini.module";


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RicettaPageRoutingModule,
    RicettaMiniModule
  ],
  declarations: [
    RicettaPage
  ]
})
export class RicettaPageModule {}
