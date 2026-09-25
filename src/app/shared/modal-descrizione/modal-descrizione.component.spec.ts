import { TestBed } from '@angular/core/testing';
import { IonModalToken } from '@ionic/angular/ion-modal-token';
import { provideIonicAngular } from '@ionic/angular/provide';

import { TipoMenu } from '../models/menu';
import { ModalDescrizioneComponent } from './modal-descrizione.component';

interface ModalFacade {
  form: { patchValue(value: object): void };
  conferma(): void;
  annulla(): void;
}

describe('ModalDescrizioneComponent', () => {
  const modalEl = { dismiss: vi.fn(), addEventListener: vi.fn() };

  function create(inputs: Record<string, unknown>) {
    TestBed.configureTestingModule({
      imports: [ModalDescrizioneComponent],
      providers: [provideIonicAngular(), { provide: IonModalToken, useValue: modalEl }],
    });
    const fixture = TestBed.createComponent(ModalDescrizioneComponent);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
    // form, conferma e annulla sono protected: il test li usa tramite questa vista.
    return fixture.componentInstance as unknown as ModalFacade;
  }

  beforeEach(() => modalEl.dismiss.mockReset());

  it('conferma solo con un nome non vuoto e lo restituisce senza spazi', () => {
    const modal = create({ title: 'Nuova cartella', descrizione: '  ' });
    modal.conferma();
    expect(modalEl.dismiss).not.toHaveBeenCalled();

    modal.form.patchValue({ descrizione: '  Fornitori  ' });
    modal.conferma();
    expect(modalEl.dismiss).toHaveBeenCalledWith({ descrizione: 'Fornitori' }, 'confirm');
  });

  it('restituisce aliquota e tipo solo quando sono richiesti', () => {
    const listino = create({ title: 'Listino', descrizione: 'Estate', aliquota: 10 });
    listino.conferma();
    expect(modalEl.dismiss).toHaveBeenLastCalledWith(
      { descrizione: 'Estate', aliquota: 10 },
      'confirm',
    );

    TestBed.resetTestingModule();
    const menu = create({ title: 'Menù', descrizione: 'Matrimonio', tipo: TipoMenu.Evento });
    menu.conferma();
    expect(modalEl.dismiss).toHaveBeenLastCalledWith(
      { descrizione: 'Matrimonio', tipo: TipoMenu.Evento },
      'confirm',
    );
  });

  it('annulla con ruolo cancel', () => {
    create({ title: 'Test' }).annulla();
    expect(modalEl.dismiss).toHaveBeenCalledWith(undefined, 'cancel');
  });
});
