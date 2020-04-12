import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {ListinoPageRoutingModule} from './listino-routing.module';

import {ListinoPage} from './listino.page';
import {SharedModule} from "../shared/shared.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        ListinoPageRoutingModule,
        SharedModule
    ],
    declarations: [ListinoPage]
})
export class ListinoPageModule {
}
