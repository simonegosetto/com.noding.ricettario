import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IngredientiPageRoutingModule } from './ingredienti-routing.module';

import { IngredientiPage } from './ingredienti.page';
import {IngredientiPipe} from './ingredienti.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IngredientiPageRoutingModule
  ],
  declarations: [
    IngredientiPage,
    IngredientiPipe
  ]
})
export class IngredientiPageModule {}
