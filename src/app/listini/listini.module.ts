import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {ListiniPageRoutingModule} from './listini-routing.module';

import {ListiniPage} from './listini.page';
import {SharedModule} from "../shared/shared.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ListiniPageRoutingModule,
        SharedModule
    ],
    declarations: [
        ListiniPage
    ],
})
export class ListiniPageModule {
}
