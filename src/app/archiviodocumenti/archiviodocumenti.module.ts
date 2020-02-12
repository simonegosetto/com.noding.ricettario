import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ArchiviodocumentiPageRoutingModule } from './archiviodocumenti-routing.module';

import { ArchiviodocumentiPage } from './archiviodocumenti.page';
import {ArchivioDocumentiPipe} from "./archiviodocumenti.pipe";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ArchiviodocumentiPageRoutingModule
  ],
  declarations: [ArchiviodocumentiPage, ArchivioDocumentiPipe]
})
export class ArchiviodocumentiPageModule {}
