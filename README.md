# Ricettario

Gestione di ricette e schede tecniche, food cost, listini prezzi, menù (alla carta ed eventi),
schede di produzione e archivio documenti. SPA **Angular 21 + Ionic 9** servita da Apache, che
parla con il backend PHP esistente (gateway verso le stored procedure MySQL, proxy Dropbox,
report PHP).

La versione precedente (Ionic 4 + Angular 8 + Cordova) è sul branch `master`.

## Stack

| | |
|---|---|
| Framework | Angular 21 (standalone, zoneless, signal, OnPush), TypeScript 5.9 `strict` |
| UI | Ionic 9 standalone (import per componente), ionicons 8, tema chiaro/scuro di sistema |
| Build | `@angular/build:application` (esbuild), output in `www/` |
| Qualità | ESLint (angular-eslint 21) + Prettier, Vitest (`ng test`), Playwright con backend simulato |
| CI | GitHub Actions: format, lint, unit test, build (artifact `www`), e2e |

## Requisiti

- Node 22 LTS (vedi `.nvmrc`; vanno bene anche 20.19+ e 24).
- npm: usare **`npm ci`**, che installa esattamente il `package-lock.json`.
  Per aggiungere o aggiornare dipendenze usare npm 11 (`npx npm@11 install <pacchetto>`):
  `npm install` di npm 10.9 su questo albero di dipendenze può fallire con
  `Cannot read properties of null (reading 'edgesOut')`.

## Avvio in locale

```bash
npm ci
npm start            # http://localhost:4200
```

In sviluppo l'app usa il **backend di produzione** (non esiste un ambiente di test) in
**modalità sola lettura** (`readOnly: true` in `src/environments/environment.development.ts`):
login, letture e stampe funzionano con i dati veri, mentre ogni scrittura (process `write` del
gateway, upload e cancellazioni Dropbox) viene bloccata dal `readOnlyInterceptor` con un
messaggio. Nel menu laterale compare l'avviso "Sola lettura".

Per provare una scrittura reale: impostare `readOnly: false`, lavorare **solo su record di prova**
(es. `ZZ_TEST …`) e rimettere `true` prima del commit.

## Comandi

| Comando | Cosa fa |
|---|---|
| `npm start` | Server di sviluppo in sola lettura |
| `npm run build` | Build di produzione in `www/` |
| `npm run lint` | ESLint su TypeScript e template |
| `npx prettier --check src e2e` | Controllo della formattazione (`--write` per correggere) |
| `npx ng test --watch=false` | Test unitari Vitest (jsdom) |
| `npm run e2e` | Test end-to-end Playwright (desktop e telefono) |
| `npm run e2e:screenshots` | Screenshot di tutte le pagine, chiaro/scuro, in `test-results/screenshots/` |
| `npm run docs:processes` | Rigenera `docs/gateway-processes.md` dal catalogo dei process |

### Test end-to-end

`npm run e2e` avvia `ng serve -c e2e` (porta 4300) e simula il backend PHP con `page.route`
(`e2e/support/backend.ts`): ogni richiesta verso il dominio di produzione viene **bloccata**, le
risposte arrivano da fixture sintetiche (`e2e/support/fixtures.ts`) e i test verificano i
parametri inviati alle stored procedure (escape degli apici compreso). La configurazione `e2e`
ha un token applicativo fittizio.

Nel container di sviluppo Chromium è già installato; altrove: `npx playwright install chromium`.

## Struttura

```
src/app/
  core/       api/ (GatewayClient, parametri SQL con escape, catalogo dei 58 process,
              interceptor sola lettura), auth/, navigation/, ui/ (toast, alert, modali, busy)
  data/       repository per dominio: classi astratte + implementazioni Gateway*Repository,
              ListiniStore (listino scelto condiviso fra le pagine), ReportService (stampe)
  shared/     modelli, modale di ricerca generico, modale descrizione, card ricetta, icone
  features/   una cartella per pagina (rotte con lazy loading in app.routes.ts)
```

Le pagine non chiamano mai HTTP direttamente: usano i repository di `data/`, registrati in
`data/providers.ts`.

## Backend e futura API NestJS

- `docs/gateway-processes.md`: tutti i process usati (parametri, risultato, lettura/scrittura) e
  le note per la riscrittura. È generato da `src/app/core/api/gateway-process-definitions.ts`.
- Per passare a NestJS basta scrivere dei `Nest*Repository` con gli stessi contratti delle classi
  astratte in `data/` e cambiare i provider in `data/providers.ts`: pagine e componenti restano
  invariati.
- Il PHP compone le `CALL` concatenando i parametri: l'escape lato client (`sql.str`, `sql.num`)
  evita gli errori con gli apici ma **non** protegge dalla SQL injection, che va chiusa lato
  server con prepared statement.

## Deploy

1. `npm ci && npm run build` (oppure scaricare l'artifact `www` dall'ultima esecuzione della CI).
2. Sul server: **backup** della cartella pubblicata attuale.
3. Caricare tutto il contenuto di `www/`, **compreso `.htaccess`** (file nascosto). I vecchi file
   `chunk-*.js` si possono lasciare qualche giorno: le schede già aperte li caricano ancora e
   in caso di errore l'app si ricarica da sola.

`.htaccess` reindirizza le rotte dell'app su `index.html` (`mod_rewrite`), fa riconvalidare
sempre `index.html` e mette in cache per un anno i bundle con l'hash nel nome (`mod_headers`).
L'app va servita dalla radice del sito (`<base href="/">`).

**Rollback**: ripristinare il backup della cartella pubblicata.

## Verifica funzionale

`docs/checklist-funzionale.md` elenca le azioni della versione legacy pagina per pagina, con
quello che cambia nella nuova versione e il test e2e che le copre.
