import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';
import { PROCESS } from '../core/api/gateway-processes';
import { provideRepositories } from './providers';
import { RicetteRepository } from './ricette.repository';

describe('GatewayRicetteRepository', () => {
  let repository: RicetteRepository;
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
    repository = TestBed.inject(RicetteRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  const expectCall = () => http.expectOne(`${environment.apiDBox}?gest=2`);

  it('salva la testata con apici raddoppiati e restituisce il cod_p della ricetta nuova', async () => {
    const codP = firstValueFrom(
      repository.save({
        cod_p: 0,
        nome_ric: "Pasta all'amatriciana",
        procedimento: null,
        prezzo_vendita: null,
        peso_effettivo: 1500.5,
      }),
    );
    const request = expectCall();
    expect(request.request.body.process).toBe(PROCESS.RICETTA_SAVE.id);
    // Procedimento vuoto e non 'undefined' come salvava la versione legacy.
    expect(request.request.body.params).toBe("0,'Pasta all''amatriciana','',0,1500.5,@out_id");
    request.flush({ output: [{ out_id: '99' }] });
    expect(await codP).toBe(99);
  });

  it('manda le righe con i parametri nell’ordine delle stored procedure', async () => {
    const inserita = firstValueFrom(
      repository.addRiga(4, { nome: 'Sale q.b.', quantita: null, ricettaid: 0, ingredienteid: 0 }),
    );
    let request = expectCall();
    expect(request.request.body.process).toBe(PROCESS.RICETTA_RIGA_INSERT.id);
    expect(request.request.body.params).toBe("'Sale q.b.',0,0,4,0");
    request.flush({});
    await inserita;

    const aggiornata = firstValueFrom(
      repository.updateRiga(4, {
        id: 12,
        nome: 'Burro',
        quantita: 250,
        perc: 10,
        ricettaid: 0,
        escludi_peso: true,
      }),
    );
    request = expectCall();
    expect(request.request.body.process).toBe(PROCESS.RICETTA_RIGA_UPDATE.id);
    expect(request.request.body.params).toBe("12,'Burro',250,0,4,1");
    request.flush({});
    await aggiornata;

    const spostata = firstValueFrom(repository.moveRiga(4, 12, 1));
    request = expectCall();
    expect(request.request.body.params).toBe('12,1,4');
    request.flush({});
    await spostata;
  });

  it('normalizza righe e totali del food cost', async () => {
    const totali = firstValueFrom(repository.foodcostTotali(4, 2));
    const request = expectCall();
    expect(request.request.body.params).toBe('4,2');
    request.flush({
      recordset: [
        {
          peso: '1800',
          foodcost: '11.25',
          kcal: 2750,
          peso_effettivo: null,
          prezzo_lordo_vendita: '12',
          ratio: '34.38',
          prezzo_netto_vendita: 10.91,
          margine_netto: '-0.34',
        },
      ],
    });
    expect(await totali).toEqual({
      peso: 1800,
      foodcost: 11.25,
      kcal: 2750,
      peso_effettivo: null,
      prezzo_lordo_vendita: 12,
      ratio: 34.38,
      prezzo_netto_vendita: 10.91,
      margine_netto: -0.34,
    });
  });
});
