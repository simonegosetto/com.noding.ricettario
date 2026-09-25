import type { Page, Request, Route } from '@playwright/test';

import { PROCESS, type ProcessName } from '../../src/app/core/api/gateway-processes';
import { DEFAULT_RESPONSES } from './fixtures';

type Params = string | number;
type Responder = (params: Params) => unknown;
type DropboxResponder = (action: DropboxCall) => unknown;

export interface GatewayCall {
  process: ProcessName;
  params: Params;
}

export interface DropboxCall {
  mode: number;
  path: string;
  [key: string]: unknown;
}

const PROCESS_BY_ID = new Map(Object.values(PROCESS).map((process) => [process.id, process.name]));

/**
 * Backend PHP simulato: risponde ai process del gateway con le fixture (sovrascrivibili nel
 * singolo test) e registra le chiamate per le asserzioni. Qualsiasi altra richiesta verso il
 * dominio di produzione viene bloccata.
 */
export class BackendMock {
  readonly calls: GatewayCall[] = [];
  readonly dropboxCalls: DropboxCall[] = [];
  private readonly responders = new Map<ProcessName, Responder>();
  private readonly dropboxResponders = new Map<number, DropboxResponder>();
  private loginResponse: unknown = {
    user: [{ nome: 'Mario', cognome: 'Rossi' }],
    token: { token: 'e2e-session' },
  };

  constructor(private readonly page: Page) {}

  /** Risposta di un process: oggetto fisso o funzione dei parametri. */
  on(process: ProcessName, response: unknown): this {
    this.responders.set(
      process,
      typeof response === 'function' ? (response as Responder) : () => response,
    );
    return this;
  }

  /** Risposta del proxy Dropbox per una modalità (1 upload, 3 delete, 4 link). */
  onDropbox(mode: number, response: unknown): this {
    this.dropboxResponders.set(
      mode,
      typeof response === 'function' ? (response as DropboxResponder) : () => response,
    );
    return this;
  }

  onLogin(response: unknown): this {
    this.loginResponse = response;
    return this;
  }

  /** Chiamate registrate per un process. */
  callsTo(process: ProcessName): Params[] {
    return this.calls.filter((call) => call.process === process).map((call) => call.params);
  }

  async install(): Promise<void> {
    // Registrata per prima: Playwright valuta le route dall'ultima alla prima.
    await this.page.route(/prodottidivalore\.it/, (route) => route.abort('blockedbyclient'));
    await this.page.route(/\/BackEnd\/FD_DataServiceGatewayCrypt\.php\?gest=2$/, (route) =>
      this.gateway(route),
    );
    await this.page.route(/\/BackEnd\/FD_Login\.php\?gest=2$/, (route) =>
      route.fulfill({ json: this.loginResponse }),
    );
    await this.page.route(/\/BackEnd\/FD_DropboxGateway\.php\?gest=2$/, (route) =>
      this.dropbox(route),
    );
  }

  private async gateway(route: Route): Promise<void> {
    const body = readJson(route.request());
    const name = PROCESS_BY_ID.get(String(body['process']));
    if (!name) {
      await route.fulfill({ status: 500, body: `process sconosciuto: ${String(body['process'])}` });
      return;
    }
    const params = body['params'] as Params;
    this.calls.push({ process: name, params });
    const responder = this.responders.get(name) ?? DEFAULT_RESPONSES[name];
    await route.fulfill({ json: responder ? responder(params) : {} });
  }

  private async dropbox(route: Route): Promise<void> {
    const action = readJson(route.request())['action'] as DropboxCall;
    this.dropboxCalls.push(action);
    const responder = this.dropboxResponders.get(action.mode);
    const fallback = action.mode === 4 ? { link: 'https://dl.example.test/file.png' } : {};
    await route.fulfill({ json: responder ? responder(action) : fallback });
  }
}

/** Il body è JSON anche se il content-type è form-urlencoded: postDataJSON() non va usato. */
function readJson(request: Request): Record<string, unknown> {
  return JSON.parse(request.postData() ?? '{}') as Record<string, unknown>;
}

/** Avvia l'app con una sessione già attiva (stesse chiavi localStorage della versione legacy). */
export async function loginAs(
  page: Page,
  user = { nome: 'Mario', cognome: 'Rossi' },
): Promise<void> {
  await page.addInitScript((utente) => {
    localStorage.setItem('token', 'e2e-session');
    localStorage.setItem('user', JSON.stringify(utente));
  }, user);
}

export async function setupBackend(page: Page): Promise<BackendMock> {
  const backend = new BackendMock(page);
  await backend.install();
  return backend;
}

/**
 * Registra gli URL aperti con window.open senza aprire finestre: sia quelli passati subito
 * (stampe) sia quelli impostati dopo su una finestra aperta vuota (file dell'archivio).
 */
export async function recordWindowOpen(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const opened: string[] = [];
    (window as unknown as { __opened: string[] }).__opened = opened;
    window.open = (url?: string | URL) => {
      if (url) {
        opened.push(String(url));
      }
      const fake = {
        opener: null as unknown,
        closed: false,
        close: () => {
          fake.closed = true;
        },
        location: { replace: (next: string) => opened.push(next) },
      };
      return fake as unknown as Window;
    };
  });
}

export async function lastOpenedUrl(page: Page): Promise<string> {
  await page.waitForFunction(
    () => (window as unknown as { __opened: string[] }).__opened.length > 0,
  );
  return page.evaluate(() => (window as unknown as { __opened: string[] }).__opened.at(-1) ?? '');
}
