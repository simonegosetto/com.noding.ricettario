import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { GatewayClient } from './gateway.client';
import { PROCESS } from './gateway-processes';
import { READ_ONLY, readOnlyInterceptor } from './read-only.interceptor';

function setup(readOnly: boolean) {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([readOnlyInterceptor])),
      provideHttpClientTesting(),
      provideRouter([]),
      { provide: READ_ONLY, useValue: readOnly },
    ],
  });
  return {
    client: TestBed.inject(GatewayClient),
    http: TestBed.inject(HttpTestingController),
  };
}

describe('readOnlyInterceptor', () => {
  it('blocca le scritture in sola lettura senza chiamare il server', async () => {
    const { client, http } = setup(true);
    const result = firstValueFrom(client.exec(PROCESS.RICETTA_DELETE, '1'));
    await expect(result).rejects.toThrow(/sola lettura: RICETTA_DELETE/);
    http.expectNone(`${environment.apiDBox}?gest=2`);
  });

  it('blocca upload e cancellazioni Dropbox ma non i link', async () => {
    const { client, http } = setup(true);
    await expect(firstValueFrom(client.dropbox({ mode: 3, path: 'x' }))).rejects.toThrow(
      /DROPBOX_DELETE/,
    );
    client.dropbox({ mode: 4, path: 'x' }).subscribe();
    http.expectOne(`${environment.apiDropbox}?gest=2`).flush({ link: 'l' });
  });

  it('lascia passare le letture', () => {
    const { client, http } = setup(true);
    client.rows(PROCESS.RICETTE_LIST, '1').subscribe();
    http.expectOne(`${environment.apiDBox}?gest=2`).flush({ recordset: [] });
    http.verify();
  });

  it('non interviene se la sola lettura è disattiva', () => {
    const { client, http } = setup(false);
    client.exec(PROCESS.RICETTA_DELETE, '1').subscribe();
    http.expectOne(`${environment.apiDBox}?gest=2`).flush({});
    http.verify();
  });
});
