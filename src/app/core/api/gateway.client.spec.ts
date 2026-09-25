import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { SessionStore } from '../auth/session.store';
import { BusyService } from '../ui/busy.service';
import { GatewayClient } from './gateway.client';
import { GatewayError } from './gateway-error';
import { PROCESS } from './gateway-processes';

describe('GatewayClient', () => {
  let client: GatewayClient;
  let http: HttpTestingController;
  let session: SessionStore;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    client = TestBed.inject(GatewayClient);
    http = TestBed.inject(HttpTestingController);
    session = TestBed.inject(SessionStore);
    router = TestBed.inject(Router);
    session.start('tok-123', { nome: 'Mario' });
  });

  afterEach(() => http.verify());

  it('invia process, params e token come la versione legacy', async () => {
    const rows = firstValueFrom(client.rows(PROCESS.RICETTE_LIST, '1'));

    const request = http.expectOne(`${environment.apiDBox}?gest=2`);
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('content-type')).toBe('application/x-www-form-urlencoded');
    expect(request.request.body).toEqual({
      type: 1,
      process: PROCESS.RICETTE_LIST.id,
      params: '1',
      token: 'tok-123',
    });
    request.flush({ recordset: [{ cod_p: 1, nome_ric: 'Ragù' }] });

    expect(await rows).toEqual([{ cod_p: 1, nome_ric: 'Ragù' }]);
  });

  it('restituisce i parametri OUT', async () => {
    const output = firstValueFrom(client.output(PROCESS.RICETTA_SAVE, "0,'x','',0,0,@out_id"));
    http.expectOne(`${environment.apiDBox}?gest=2`).flush({ output: [{ out_id: 42 }] });
    expect(await output).toEqual({ out_id: 42 });
  });

  it('tratta come errore la presenza della chiave error', async () => {
    const result = firstValueFrom(client.exec(PROCESS.LISTINO_DELETE, '3'));
    http.expectOne(`${environment.apiDBox}?gest=2`).flush({ error: 'Listino in uso' });
    await expect(result).rejects.toThrow('Listino in uso');
  });

  it('chiude la sessione se il backend rifiuta il token', async () => {
    const navigate = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const result = firstValueFrom(client.exec(PROCESS.NOTE_GET));
    http.expectOne(`${environment.apiDBox}?gest=2`).flush({ error: 'Token non valido' });

    const error = await result.catch((e: unknown) => e);
    expect(error).toBeInstanceOf(GatewayError);
    expect((error as GatewayError).sessionExpired).toBe(true);
    expect(session.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
    expect(navigate).toHaveBeenCalledWith('/login', { replaceUrl: true });
  });

  it('normalizza gli errori HTTP', async () => {
    const result = firstValueFrom(client.exec(PROCESS.NOTE_GET));
    http
      .expectOne(`${environment.apiDBox}?gest=2`)
      .flush('boom', { status: 500, statusText: 'Server Error' });
    await expect(result).rejects.toThrow('Errore del server (500).');
  });

  it('segnala le chiamate in corso a BusyService', () => {
    const busy = TestBed.inject(BusyService);
    client.exec(PROCESS.NOTE_GET).subscribe();
    expect(busy.busy()).toBe(true);
    http.expectOne(`${environment.apiDBox}?gest=2`).flush({});
    expect(busy.busy()).toBe(false);
  });

  it('fa il login con il token applicativo e restituisce token e utente', async () => {
    const login = firstValueFrom(client.login('mario', 'segreta'));
    const request = http.expectOne(`${environment.apiAuth}?gest=2`);
    expect(request.request.body).toEqual({
      type: 1,
      username: 'mario',
      password: 'segreta',
      token: environment.TOKEN,
    });
    request.flush({ user: [{ nome: 'Mario' }], token: { token: 'nuovo' } });
    expect(await login).toEqual({ token: 'nuovo', user: { nome: 'Mario' } });
  });

  it('chiede il link temporaneo al proxy Dropbox', async () => {
    const link = firstValueFrom(
      client.dropbox<{ link: string }>({ mode: 4, path: 'ricette/1.png' }),
    );
    const request = http.expectOne(`${environment.apiDropbox}?gest=2`);
    expect(request.request.body).toEqual({
      action: { mode: 4, path: 'ricette/1.png' },
      token: 'tok-123',
    });
    request.flush({ link: 'https://dl.example/1.png' });
    expect(await link).toEqual({ link: 'https://dl.example/1.png' });
  });
});
