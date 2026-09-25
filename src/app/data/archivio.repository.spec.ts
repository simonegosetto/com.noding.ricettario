import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';
import { PROCESS } from '../core/api/gateway-processes';
import { ArchivioElemento } from '../shared/models/archivio-file';
import { ArchivioRepository } from './archivio.repository';
import { provideRepositories } from './providers';

describe('GatewayArchivioRepository', () => {
  let repository: ArchivioRepository;
  let http: HttpTestingController;

  const gateway = `${environment.apiDBox}?gest=2`;
  const dropbox = `${environment.apiDropbox}?gest=2`;
  /** Le richieste arrivano dopo la lettura asincrona del file (FileReader). */
  const nextRequest = (url: string) => vi.waitFor(() => http.expectOne(url));

  const file = (nome = "Menu dell'estate.pdf") =>
    new File(['%PDF-1.4'], nome, { type: 'application/pdf' });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideRepositories(),
      ],
    });
    repository = TestBed.inject(ArchivioRepository);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('distingue cartelle e file e legge i dati della cartella dai parametri OUT', async () => {
    const contenuto = firstValueFrom(repository.contenuto(5));
    const request = http.expectOne(gateway);
    expect(request.request.body.process).toBe(PROCESS.ARCHIVIO_LIST.id);
    expect(request.request.body.params).toBe('5,@foldername,@parentid,@parentname');
    request.flush({
      recordset: [
        { folderid: 7, arc_codi: 0, descrizione: '2024', icon: 'folder', numero_file: 2 },
        { folderid: 5, arc_codi: '31', descrizione: 'a.pdf', icon: null, id_storage: 'id:x' },
      ],
      output: [{ foldername: 'Fatture', parentid: '0', parentname: null }],
    });

    const { elementi, ...cartella } = await contenuto;
    expect(cartella).toEqual({ folderId: 5, folderName: 'Fatture', parentId: 0, parentName: null });
    expect(elementi.map((e) => [e.isCartella, e.icon, e.arc_codi])).toEqual([
      [true, 'folder', 0],
      [false, 'document', 31],
    ]);
  });

  it('carica un file: record nel DB e poi contenuto su Dropbox con l’id restituito', async () => {
    const upload = firstValueFrom(repository.uploadFile(5, file()));

    const insert = await nextRequest(gateway);
    expect(insert.request.body.process).toBe(PROCESS.ARCHIVIO_FILE_INSERT.id);
    expect(insert.request.body.params).toBe(
      "'Menu dell''estate.pdf','Menu dell''estate.pdf',5,8,'application/pdf',@out_id",
    );
    insert.flush({ output: [{ out_id: 42 }] });

    const send = await nextRequest(dropbox);
    expect(send.request.body.action).toEqual({
      mode: 1,
      path: 'documenti/',
      id: 42,
      name: "Menu dell'estate.pdf",
      type: 'application/pdf',
      data: `data:application/pdf;base64,${btoa('%PDF-1.4')}`,
    });
    send.flush({});
    await expect(upload).resolves.toBeUndefined();
  });

  it('se Dropbox rifiuta il file elimina il record appena creato e riporta l’errore', async () => {
    const upload = firstValueFrom(repository.uploadFile(5, file('a.pdf')));
    (await nextRequest(gateway)).flush({ output: [{ out_id: 42 }] });
    (await nextRequest(dropbox)).flush({ error: 'Spazio esaurito' });

    const compensazione = await nextRequest(gateway);
    expect(compensazione.request.body.process).toBe(PROCESS.ARCHIVIO_FILE_DELETE.id);
    expect(compensazione.request.body.params).toBe(42);
    compensazione.flush({});
    await expect(upload).rejects.toThrow('Spazio esaurito');
  });

  it('non manda niente a Dropbox se il DB non restituisce l’id', async () => {
    const upload = firstValueFrom(repository.uploadFile(5, file('a.pdf')));
    (await nextRequest(gateway)).flush({ output: [{}] });
    await expect(upload).rejects.toThrow('id del file');
    http.expectNone(dropbox);
  });

  it('elimina il file dal DB e poi da Dropbox', async () => {
    const elemento = { arc_codi: 31, id_storage: 'id:x' } as ArchivioElemento;
    const eliminato = firstValueFrom(repository.deleteFile(elemento), { defaultValue: undefined });
    const db = http.expectOne(gateway);
    expect(db.request.body.process).toBe(PROCESS.ARCHIVIO_FILE_DELETE.id);
    http.expectNone(dropbox);
    db.flush({});
    const storage = http.expectOne(dropbox);
    expect(storage.request.body.action).toEqual({ mode: 3, path: 'id:x' });
    storage.flush({});
    await eliminato;
  });
});
