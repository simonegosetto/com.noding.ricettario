import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SchedaproduzionePageRoutingModule } from './schedaproduzione-routing.module';

import { SchedaproduzionePage } from './schedaproduzione.page';
import {RicettaSchedaTecnicaComponent} from "./ricetta-scheda-tecnica.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SchedaproduzionePageRoutingModule
  ],
  declarations: [SchedaproduzionePage,RicettaSchedaTecnicaComponent]
})
export class SchedaproduzionePageModule {}
