import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IngredientePageRoutingModule } from './ingrediente-routing.module';

import { IngredientePage } from './ingrediente.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    IngredientePageRoutingModule
  ],
  declarations: [IngredientePage]
})
export class IngredientePageModule {}
