import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {Device} from "@ionic-native/device/ngx";
import {Network} from '@ionic-native/network/ngx';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {ModalSearchRicettaComponent} from "./ricetta/modal-search-ricetta.component";
import {ModalCaricaFileComponent} from "./archiviodocumenti/modal-carica-file.component";
import {ModalDescrizioneComponent} from "./shared/modal/modal-descrizione.component";
import {ModalSearchRicettaListinoComponent} from "./listino/modal-search-ricetta-listino.component";
import {ModalSearchIngredienteListinoComponent} from "./listino/modal-search-ingrediente-listino.component";
import {ModalEditIngredienteListinoComponent} from "./listino/modal-edit-ingrediente-listino.component";
import {ModalSearchIngredientiComponent} from "./ricetta/modal-search-ingredienti.component";
import {SharedModule} from "./shared/shared.module";
import {ModalArchivioFolderComponent} from "./archiviodocumenti/modal-archivio-folder.component";

@NgModule({
    declarations: [
        AppComponent,
        ModalSearchRicettaComponent,
        ModalCaricaFileComponent,
        ModalDescrizioneComponent,
        ModalSearchRicettaListinoComponent,
        ModalSearchIngredienteListinoComponent,
        ModalEditIngredienteListinoComponent,
        ModalSearchIngredientiComponent,
        ModalArchivioFolderComponent,
    ],
    entryComponents: [
        ModalSearchRicettaComponent,
        ModalCaricaFileComponent,
        ModalDescrizioneComponent,
        ModalSearchRicettaListinoComponent,
        ModalSearchIngredienteListinoComponent,
        ModalEditIngredienteListinoComponent,
        ModalSearchIngredientiComponent,
        ModalArchivioFolderComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        SharedModule
    ],
    exports: [
        ModalSearchRicettaComponent,
        ModalCaricaFileComponent,
        ModalDescrizioneComponent,
        ModalSearchRicettaListinoComponent,
        ModalSearchIngredienteListinoComponent,
        ModalEditIngredienteListinoComponent,
        ModalSearchIngredientiComponent,
        ModalArchivioFolderComponent,
    ],
    providers: [
        StatusBar,
        SplashScreen,
        Network,
        Device,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
