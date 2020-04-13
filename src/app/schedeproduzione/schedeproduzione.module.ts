import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SchedeproduzionePageRoutingModule } from './schedeproduzione-routing.module';

import { SchedeproduzionePage } from './schedeproduzione.page';
import {SharedModule} from "../shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SchedeproduzionePageRoutingModule,
    SharedModule
  ],
  declarations: [SchedeproduzionePage]
})
export class SchedeproduzionePageModule {}
