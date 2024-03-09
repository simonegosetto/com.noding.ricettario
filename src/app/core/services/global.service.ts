import {Injectable} from '@angular/core';
import {HttpHeaders, HttpErrorResponse, HttpClient} from '@angular/common/http';
import {throwError} from 'rxjs';
import {Observable} from 'rxjs/internal/Observable';
import {catchError, map, tap} from 'rxjs/operators';
import {Platform} from '@ionic/angular';
import {LoadingService} from './loading.service';
import {ToastService} from './toast.service';
import {Device} from '@ionic-native/device/ngx';
import {environment} from "../../../environments/environment";
import {IGatewayResponse} from "../interfaces/gateway-response";

@Injectable({
    providedIn: 'root'
})
export class GlobalService {

    constructor(private _http: HttpClient,
                public platform: Platform,
                public loading: LoadingService,
                public toast: ToastService,
                public device: Device
    ) {
    }

    public online = false;
    public http_json_headers = new HttpHeaders().set('content-type', 'application/x-www-form-urlencoded'); // .set('content-type', 'application/json').set('Access-Control-Allow-Origin', '*');
    public user;
    public logged = true;

    public data = {
        IdClienteGenerico: 'XXX',
        nazioniList: []
    };

    //////////////////////// GLOBAL FUNCTION /////////////////////////

    public callGateway(process, params, loader = true, gtw = '', loaderDuration = 2000): Observable<IGatewayResponse> {
        if (loader) {
            this.loading.present(loaderDuration);
        }
        return this._http.post<IGatewayResponse>(
            environment.apiDBox + '?gest=2',
            {
                type: 1,
                process: process,
                params: params,
                token: localStorage.getItem('token')
            },
            {
                headers: this.http_json_headers
            }
        ).pipe(
            tap((data: any) => {
                if (data.error && data.error.toLowerCase().indexOf('token') > -1) {
                    data.error = 'Sessione scaduta ! Rifare l\'accesso ';
                    if (localStorage.getItem('token')) {
                        this.logout();
                        window.location.reload();
                    }
                    return data;
                }
            }),
            catchError(this.error_handler)
        );
    }


    public callDropbox(action, loader = true, loaderDuration = 2000): Observable<any> {
        if (loader) {
            this.loading.present(loaderDuration);
        }
        return this._http.post<IGatewayResponse>(
            environment.apiDropbox + '?gest=2',
            {
                action: action,
                token: localStorage.getItem('token')
            },
            {
                headers: this.http_json_headers
            }
        ).pipe(
            catchError(this.error_handler)
        );
    }

    public checkUser(): boolean {
        if (this.user !== undefined && this.user !== null && localStorage.getItem('token') !== null && localStorage.getItem('user') !== null) {
            this.logged = true;
            return true;
        } else {
            this.logged = false;
            return false;
        }
    }

    // potrei allocare direttamente qui il token che mi ritorna il server
    // e rendere solo un booleano
    public login(username, password): Observable<any> {
        /*if (!this.online) {
            this.toast.present('Your Device is OFFLINE !', 5000);
        }*/
        return this._http.post(
            environment.apiAuth + '?gest=2',
            {
                type: 1,
                username: username,
                password: password,
                token: environment.TOKEN
            },
            {
                headers: this.http_json_headers
            }
        ).pipe(
            catchError(this.error_handler)
        );
    }

    public logout(): boolean {
        this.user = undefined;
        this.logged = false;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return true;
    }

    //////////////////////// UTILITY /////////////////////////

    public normalizeNumberString(string) {
        string = this.isnull(string);
        return string.toString().replace('"', '').replace('"', '');
    }

    public focusInput(input) {
        setTimeout(() => {
            input.setFocus();
        }, 150);

    }

    public isnull(value, replace: any = '') {
        if (value === null || value === undefined || value === 'null') {
            if (replace !== null && replace !== undefined) {
                return replace;
            }
            return '';
        }
        return value;
    }

    public checkConnection(): boolean {
        const networkState = navigator['connection'].type || navigator['connection'].effectiveType;

        const Connection = window['Connection'] || {
            'CELL': 'cellular',
            'CELL_2G': '2g',
            'CELL_3G': '3g',
            'CELL_4G': '4g',
            'ETHERNET': 'ethernet',
            'NONE': 'none',
            'UNKNOWN': 'unknown',
            'WIFI': 'wif'
        };

        const states = {};
        states[Connection.UNKNOWN] = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI] = 'WiFi connection';
        states[Connection.CELL_2G] = 'Cell 2G connection';
        states[Connection.CELL_3G] = 'Cell 3G connection';
        states[Connection.CELL_4G] = 'Cell 4G connection';
        states[Connection.CELL] = 'Cell generic connection';
        states[Connection.NONE] = 'No network connection';

        this.online = !(networkState === Connection.NONE);
        // this.presentToast('Connection type: ' + states[networkState], 5000);

        return this.online;
    }

    public isApp(): boolean {
        return (
            document.URL.indexOf('http://localhost') === 0 ||
            document.URL.indexOf('ionic') === 0 ||
            document.URL.indexOf('https://localhost') === 0
        ); // && !isDevMode();
    }

    public isBrowser(): boolean {
        return !this.isApp();
    }

    public isIOS(): boolean {
        return this.platform.is('ios') || this.platform.is('ipad') || this.platform.is('iphone');
    }

    public isOnline(): boolean {
        return this.online;
    }

    public isDesktop(): boolean {
        return this.platform.is('desktop');
    }

    //////////////////////// INIT /////////////////////////

    public init() {
        this.checkUser();
    }

    //////////////////////// DATA /////////////////////////


    //////////////////////// ERROR ENDLER /////////////////////////

    public error_handler(error: HttpErrorResponse) {
        console.log('errore ', error.message);
        if (this.loading !== undefined) {
            this.loading.dismiss();
        }
        if (this.toast) {
            this.toast.present(error.message || 'Errore Generico', 3000);
        }
        return throwError(error.message || 'Errore Generico');
    }

    ///////////////////////////////////////////////////////////////

}
