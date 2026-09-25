import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';
import { PROCESS } from '../core/api/gateway-processes';
import { provideRepositories } from './providers';
import { ListiniRepository } from './listini.repository';

describe('GatewayListiniRepository', () => {
  let repository: ListiniRepository;
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
    repository = TestBed.inject(ListiniRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  const expectCall = () => http.expectOne(`${environment.apiDBox}?gest=2`);

  it('normalizza le righe e separa le ricette del GROUP_CONCAT', async () => {
    const righe = firstValueFrom(repository.righe(7, 0));
    const request = expectCall();
    expect(request.request.body.process).toBe(PROCESS.LISTINO_RIGHE.id);
    expect(request.request.body.params).toBe('7,0');
    request.flush({
      recordset: [
        {
          id: '3',
          ingredienteid: 9,
          descrizione: 'Farina 00',
          scarto: '2.5',
          grammatura: 1000,
          prezzo: '0.9',
          categoriaid: null,
          categorianome: null,
          kcal: 340,
          provenienza: '',
          ricette: 'Pane<p></p>Pizza',
        },
      ],
    });

    expect(await righe).toEqual([
      {
        id: 3,
        listinoid: 7,
        ingredienteid: 9,
        descrizione: 'Farina 00',
        scarto: 2.5,
        grammatura: 1000,
        prezzo: 0.9,
        categoriaid: null,
        categorianome: null,
        kcal: 340,
        provenienza: null,
        ricette: ['Pane', 'Pizza'],
      },
    ]);
  });

  it('aggiorna una riga con i parametri nell’ordine della stored procedure', () => {
    repository
      .updateRiga({
        id: 3,
        descrizione: "Farina d'Abruzzo",
        scarto: 2,
        grammatura: 1000,
        prezzo: 1.2,
        categoriaid: null,
        kcal: 340,
        provenienza: null,
      })
      .subscribe();
    expect(expectCall().request.body.params).toBe("3,2,1000,1.2,NULL,340,'Farina d''Abruzzo',''");
  });

  it('aggiunge un menù al listino con l’ordine dei parametri invertito', () => {
    repository.addMenu(7, 12).subscribe();
    const request = expectCall();
    expect(request.request.body.process).toBe(PROCESS.LISTINO_ADD_MENU.id);
    expect(request.request.body.params).toBe('12,7');
  });
});
