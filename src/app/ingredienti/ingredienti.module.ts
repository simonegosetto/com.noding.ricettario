import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IngredientiPageRoutingModule } from './ingredienti-routing.module';

import { IngredientiPage } from './ingredienti.page';
import {AppModule} from "../app.module";
import {SharedModule} from "../shared/shared.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        IngredientiPageRoutingModule,
        AppModule,
        SharedModule
    ],
  declarations: [
    IngredientiPage,
  ]
})
export class IngredientiPageModule {}
