import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { PROCESS } from '../core/api/gateway-processes';
import { SessionStore } from '../core/auth/session.store';
import { TipoMenu } from '../shared/models/menu';
import { ReportService } from './report.service';

describe('ReportService', () => {
  let reports: ReportService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.inject(SessionStore).start('abc123', {});
    reports = TestBed.inject(ReportService);
  });

  const params = (url: string) => Object.fromEntries(new URL(url).searchParams);

  it('stampa le ricette semplici in XML dal gateway dati', () => {
    const url = reports.ricetta(15, false);
    expect(url.startsWith(`${environment.apiDBox}?`)).toBe(true);
    expect(params(url)).toEqual({
      gest: '3',
      type: '1',
      process: PROCESS.RICETTA_GET.id,
      params: '15',
      token: 'abc123',
      report: 'ricetta.xml',
    });
  });

  it('stampa le ricette composte con food cost dal report HTML', () => {
    const url = reports.ricettaDettaglio(15, true, true, 4);
    expect(url.startsWith(`${environment.apiReportRicetta}?`)).toBe(true);
    expect(params(url)).toMatchObject({ report: 'ricetta.html', foodcost: '1', listino: '4' });
  });

  it('stampa la scheda tecnica con l’elenco delle ricette', () => {
    const url = reports.schedaTecnica([1, 2, 3], 'Pranzo di Natale', false, 4);
    expect(params(url)).toMatchObject({
      params: '1,2,3',
      report: 'schedatecnica.html',
      foodcost: '0',
      listino: '4',
      descrizione: 'Pranzo di Natale',
    });
  });

  it('sceglie il report del menù in base al tipo e alla variante', () => {
    const menu = {
      id: 8,
      descrizione: 'Matrimonio',
      tipo: TipoMenu.Evento,
      pax: 80,
      perc_ricetta: 10,
    };
    const url = reports.menu(menu, 4, 'bom');
    expect(url.startsWith(`${environment.apiReportMenuEvento}?`)).toBe(true);
    expect(params(url)).toEqual({
      menu: '8',
      listino: '4',
      bom: '1',
      descrizione: 'Matrimonio',
      token: 'abc123',
    });
  });
});
