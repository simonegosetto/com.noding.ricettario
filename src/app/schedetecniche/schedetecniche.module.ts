import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SchedetecnichePageRoutingModule } from './schedetecniche-routing.module';

import { SchedetecnichePage } from './schedetecniche.page';
import {RicettaSchedaTecnicaComponent} from "./ricetta-scheda-tecnica.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SchedetecnichePageRoutingModule
  ],
  declarations: [SchedetecnichePage, RicettaSchedaTecnicaComponent]
})
export class SchedetecnichePageModule {}
