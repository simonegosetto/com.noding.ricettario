import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FoodcostPageRoutingModule } from './foodcost-routing.module';

import { FoodcostPage } from './foodcost.page';
import { FoodcostPipe } from './foodcost.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FoodcostPageRoutingModule
  ],
  declarations: [FoodcostPage, FoodcostPipe]
})
export class FoodcostPageModule {}
