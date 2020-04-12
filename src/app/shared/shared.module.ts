import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {DescrizionePipe} from "./pipes/descrizione.pipe";
import {IonicModule} from "@ionic/angular";

@NgModule({
    declarations: [
        DescrizionePipe,
    ],
    imports: [
        CommonModule,
        IonicModule
    ],
    exports: [
        DescrizionePipe,
    ]
})
export class SharedModule {
}
