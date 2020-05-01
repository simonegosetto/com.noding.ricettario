import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {MenuPageRoutingModule} from './menu-routing.module';

import {MenuPage} from './menu.page';
import {MenuAllaCartaComponent} from "./menu-alla-carta.component";
import {SharedModule} from "../shared/shared.module";
import {MenuEventoComponent} from "./menu-evento.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        MenuPageRoutingModule,
        SharedModule
    ],
    declarations: [
        MenuPage,
        MenuAllaCartaComponent,
        MenuEventoComponent
    ]
})
export class MenuPageModule {
}
