/**
 * Genera docs/gateway-processes.md dal catalogo dei process del gateway.
 * Uso: `npm run docs:processes` (Node >= 22.18, che esegue direttamente i file TypeScript).
 */
import { writeFileSync } from 'node:fs';

import {
  PROCESS_DEFINITIONS,
  UNUSED_PROCESS_PREFIXES,
} from '../src/app/core/api/gateway-process-definitions.ts';

const output = new URL('../docs/gateway-processes.md', import.meta.url);
const escape = (text: string) => text.replaceAll('|', '\\|');

const sections = new Map<string, string[]>();
for (const [name, definition] of Object.entries(PROCESS_DEFINITIONS)) {
  const rows = sections.get(definition.section) ?? [];
  rows.push(
    `| \`${name}\` | ${definition.kind === 'write' ? 'scrittura' : 'lettura'} | ${escape(definition.params)} | ${escape(definition.returns)} | \`${definition.id.slice(0, 8)}…\` |`,
  );
  sections.set(definition.section, rows);
}

const total = Object.keys(PROCESS_DEFINITIONS).length;
const writes = Object.values(PROCESS_DEFINITIONS).filter((d) => d.kind === 'write').length;

const lines = [
  '# Process del gateway dati',
  '',
  '<!-- File generato da scripts/gateway-processes-doc.ts: non modificarlo a mano. -->',
  '',
  'Il frontend chiama `FD_DataServiceGatewayCrypt.php?gest=2` con il body JSON',
  '`{type: 1, process, params, token}`. `process` è un id cifrato che il PHP risolve nella stored',
  'procedure da eseguire; `params` è la lista posizionale dei parametri già formattati come letterali',
  'SQL (stringhe tra apici, parametri OUT come `@nome`), costruita con `sql.*` di',
  '`src/app/core/api/gateway-params.ts`. La risposta è `{recordset, output}` oppure `{error}`.',
  '',
  `Process usati: **${total}** (${total - writes} letture, ${writes} scritture). In sviluppo le scritture`,
  'sono bloccate dal `readOnlyInterceptor`.',
  '',
  '## Note per il backend NestJS',
  '',
  '- Ogni process corrisponde a un endpoint: le letture a `GET`, le scritture a `POST`/`PUT`/`DELETE`.',
  '- Il PHP compone la chiamata concatenando `params`: va sostituito da prepared statement',
  '  (`CALL sp(?, ?, @out)`) sulle stesse stored procedure. Oggi è un vettore di SQL injection.',
  '- Il token viaggia nel body e, per i report, in query string: va spostato in un header',
  '  `Authorization`.',
  '- Le implementazioni da sostituire sono i `Gateway*Repository` in `src/app/data/`.',
  '- Archivio: il caricamento di un file è in due passi (record con `ARCHIVIO_FILE_INSERT`, poi',
  '  upload Dropbox con `out_id` come nome) e il client rimuove il record se l\'upload fallisce;',
  '  un endpoint unico (multipart) lo renderebbe atomico. `ARCHIVIO_CARTELLA_DELETE` elimina i',
  '  record ma lascia su Dropbox i file delle cartelle eliminate.',
  '',
];

for (const [section, rows] of sections) {
  lines.push(
    `## ${section}`,
    '',
    '| Process | Tipo | Parametri | Risultato | Id |',
    '|---|---|---|---|---|',
    ...rows,
    '',
  );
}

lines.push(
  '## Altri endpoint',
  '',
  '| Endpoint | Uso |',
  '|---|---|',
  '| `FD_Login.php?gest=2` | Login: `{type: 1, username, password, token}` con il token applicativo statico; risponde `{user: [...], token: {token}}` |',
  '| `FD_DropboxGateway.php?gest=2` | Proxy Dropbox: `{action: {mode, path, ...}, token}`; mode 1 upload (data URL base64), 3 cancellazione, 4 link temporaneo |',
  '| `ReportService/*.php`, `FD_DataServiceGatewayCrypt.php?gest=3` | Stampe aperte in una nuova finestra, parametri e token in query string (vedi `src/app/data/report.service.ts`) |',
  '',
  '## Process non più usati',
  '',
  'Servivano solo alle pagine Ingredienti/Ingrediente, eliminate nel porting.',
  '',
  '| Process | Id |',
  '|---|---|',
  ...Object.entries(UNUSED_PROCESS_PREFIXES).map(
    ([name, prefix]) => `| \`${name}\` | \`${prefix}…\` |`,
  ),
  '',
);

writeFileSync(output, lines.join('\n'));
console.log(`Scritto ${output.pathname} (${total} process)`);
