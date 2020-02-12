import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ArchiviodocumentoPageRoutingModule } from './archiviodocumento-routing.module';

import { ArchiviodocumentoPage } from './archiviodocumento.page';
import { NoextensionPipe } from './noextension.pipe';
import {ArchivioDocumentoPipe} from "./archiviodocumento.pipe";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ArchiviodocumentoPageRoutingModule
  ],
  declarations: [ArchiviodocumentoPage, NoextensionPipe, ArchivioDocumentoPipe]
})
export class ArchiviodocumentoPageModule {}
