import { TestBed } from '@angular/core/testing';
import { IonModalToken, provideIonicAngular } from '@ionic/angular';
import { of } from 'rxjs';

import { SearchModalComponent } from './search-modal.component';
import { SearchSource } from './search-source';

interface Voce {
  id: number;
  nome: string;
}

describe('SearchModalComponent', () => {
  const modalEl = { dismiss: vi.fn(), addEventListener: vi.fn() };
  const voci: Voce[] = [
    { id: 1, nome: 'Farina 00' },
    { id: 2, nome: 'Farina di farro' },
    { id: 3, nome: 'Burro' },
  ];

  function create(source: SearchSource<Voce>) {
    TestBed.configureTestingModule({
      imports: [SearchModalComponent],
      providers: [provideIonicAngular(), { provide: IonModalToken, useValue: modalEl }],
    });
    const fixture = TestBed.createComponent(SearchModalComponent<Voce>);
    fixture.componentRef.setInput('title', 'Cerca');
    fixture.componentRef.setInput('source', source);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as {
      query: { set(v: string): void };
      visible(): Voce[];
      hint(): string | null;
      scegli(v: Voce): void;
    };
    return { fixture, component };
  }

  it('in modalità client carica tutto una volta e filtra localmente', async () => {
    const load = vi.fn(() => of(voci));
    const { fixture, component } = create({
      mode: 'client',
      minChars: 0,
      load,
      label: (v) => v.nome,
      key: (v) => v.id,
    });
    await fixture.whenStable();
    expect(component.visible()).toHaveLength(3);

    component.query.set('farina');
    await fixture.whenStable();
    expect(component.visible().map((v) => v.id)).toEqual([1, 2]);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('in modalità server cerca solo dopo i caratteri minimi', async () => {
    const load = vi.fn((text: string) => of(voci.filter((v) => v.nome.includes(text))));
    const { fixture, component } = create({
      mode: 'server',
      minChars: 3,
      load,
      label: (v) => v.nome,
      key: (v) => v.id,
    });
    await fixture.whenStable();
    expect(component.hint()).toBe('Scrivi almeno 3 caratteri');

    component.query.set('Bu');
    await fixture.whenStable();
    expect(load).not.toHaveBeenCalled();

    component.query.set('Burro');
    await fixture.whenStable();
    expect(load).toHaveBeenCalledWith('Burro');
    expect(component.visible()).toEqual([{ id: 3, nome: 'Burro' }]);

    component.query.set('Zucchero');
    await fixture.whenStable();
    expect(component.hint()).toBe('Nessun risultato');
  });

  it('chiude restituendo la voce scelta', () => {
    const { component } = create({
      mode: 'client',
      minChars: 0,
      load: () => of(voci),
      label: (v) => v.nome,
      key: (v) => v.id,
    });
    component.scegli(voci[2]);
    expect(modalEl.dismiss).toHaveBeenCalledWith(voci[2], 'confirm');
  });
});
