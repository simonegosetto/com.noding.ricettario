import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ArchiviodocumentiPageRoutingModule } from './archiviodocumenti-routing.module';

import { ArchiviodocumentiPage } from './archiviodocumenti.page';
import {SharedModule} from "../shared/shared.module";
import {NoextensionPipe} from "./noextension.pipe";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ArchiviodocumentiPageRoutingModule,
        SharedModule
    ],
  declarations: [ArchiviodocumentiPage, NoextensionPipe]
})
export class ArchiviodocumentiPageModule {}
