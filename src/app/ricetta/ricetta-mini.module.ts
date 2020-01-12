import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import {RicettaMiniComponent} from "./ricetta-mini.component";


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule
    ],
    exports: [
        RicettaMiniComponent
    ],
    declarations: [
        RicettaMiniComponent
    ]
})
export class RicettaMiniModule {}
