import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';
import { PROCESS } from '../core/api/gateway-processes';
import { TipoMenu } from '../shared/models/menu';
import { MenuRepository } from './menu.repository';
import { provideRepositories } from './providers';

describe('GatewayMenuRepository', () => {
  let repository: MenuRepository;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideRepositories(),
      ],
    });
    repository = TestBed.inject(MenuRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  const expectCall = () => http.expectOne(`${environment.apiDBox}?gest=2`);

  it('distingue intestazioni di categoria e piatti del menù alla carta', async () => {
    const righe = firstValueFrom(repository.righeAllaCarta(1, 2));
    const request = expectCall();
    expect(request.request.body.process).toBe(PROCESS.MENU_ALLA_CARTA_RIGHE.id);
    expect(request.request.body.params).toBe('1,2');
    request.flush({
      recordset: [
        { tipo: 1, id: 2, categoria: 'Primi' },
        { tipo: '2', id: 31, ricettaid: 2, descrizione: 'Lasagne', foodcost: '3.2' },
      ],
    });
    expect(await righe).toEqual([
      { kind: 'categoria', id: 2, categoria: 'Primi' },
      {
        kind: 'piatto',
        id: 31,
        ricettaid: 2,
        descrizione: 'Lasagne',
        foodcost: 3.2,
        prezzo_lordo_vendita: null,
      },
    ]);
  });

  it('nel menù evento il tipo 2 è un separatore', async () => {
    const righe = firstValueFrom(repository.righeEvento(2, 1));
    expectCall().flush({
      recordset: [
        { tipo: 1, id: 41, ricettaid: 1, descrizione: 'Ragù' },
        { tipo: 2, id: 43 },
      ],
    });
    expect((await righe).map((riga) => riga.kind)).toEqual(['piatto', 'separatore']);
  });

  it('crea un menù nuovo con pax e percentuale a 0, altrimenti aggiorna nome e tipo', async () => {
    const nuovo = firstValueFrom(
      repository.save({ id: 0, descrizione: "Cena d'autunno", tipo: TipoMenu.Evento }),
    );
    let request = expectCall();
    expect(request.request.body.process).toBe(PROCESS.MENU_INSERT.id);
    expect(request.request.body.params).toBe("0,'Cena d''autunno',2,0,0");
    request.flush({});
    await nuovo;

    const esistente = firstValueFrom(
      repository.save({ id: 5, descrizione: 'Carta', tipo: TipoMenu.AllaCarta }),
    );
    request = expectCall();
    expect(request.request.body.process).toBe(PROCESS.MENU_UPDATE.id);
    expect(request.request.body.params).toBe("5,'Carta',1");
    request.flush({});
    await esistente;
  });
});
