/**
 * Riscrive gli import `from '@ionic/angular'` nei subpath per componente di Ionic 9
 * (es. IonInput -> '@ionic/angular/ion-input'): con il barrel esbuild mette tutti i
 * componenti Ionic usati dall'app nel chunk iniziale. I tipi restano `import type`.
 * Uso: node scripts/ionic-subpath-imports.mjs [file...]  (default: tutti i .ts in src/)
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = join(dirname(new URL(import.meta.url).pathname), '..');
const pkgDir = join(root, 'node_modules/@ionic/angular');
const pkg = JSON.parse(readFileSync(join(pkgDir, 'package.json'), 'utf8'));

// simbolo -> subpath, leggendo le dichiarazioni di ogni subpath esportato
const bySymbol = new Map();
for (const [subpath, target] of Object.entries(pkg.exports)) {
  if (subpath === '.' || subpath.includes('*') || typeof target !== 'string' || !target.endsWith('.js')) continue;
  if (['./lazy', './common', './package.json'].includes(subpath)) continue;
  const dts = join(pkgDir, target.replace(/\.js$/, '.d.ts'));
  const text = readFileSync(dts, 'utf8');
  for (const match of text.matchAll(/export\s*\{([^}]+)\}/g)) {
    for (const name of match[1].split(',').map((s) => s.trim().split(/\s+as\s+/).pop()).filter(Boolean)) {
      if (!bySymbol.has(name)) bySymbol.set(name, `@ionic/angular/${subpath.slice(2)}`);
    }
  }
  for (const match of text.matchAll(/export declare (?:const|class|function)\s+(\w+)/g)) {
    if (!bySymbol.has(match[1])) bySymbol.set(match[1], `@ionic/angular/${subpath.slice(2)}`);
  }
}

const files = process.argv.slice(2).length ? process.argv.slice(2) : walk(join(root, 'src'));
let changed = 0;
for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const output = source.replace(
    /import\s+(type\s+)?\{([^}]+)\}\s+from\s+'@ionic\/angular';\n/g,
    (all, typeOnly, list) => {
      const names = list.split(',').map((s) => s.trim()).filter(Boolean);
      const types = [];
      const groups = new Map();
      for (const raw of names) {
        const name = raw.replace(/^type\s+/, '');
        const subpath = bySymbol.get(name);
        if (typeOnly || raw.startsWith('type ') || !subpath) {
          types.push(name);
        } else {
          groups.set(subpath, [...(groups.get(subpath) ?? []), name]);
        }
      }
      let text = '';
      for (const [subpath, list] of [...groups].sort(([a], [b]) => a.localeCompare(b))) {
        text += `import { ${list.join(', ')} } from '${subpath}';\n`;
      }
      if (types.length) text += `import type { ${types.join(', ')} } from '@ionic/angular';\n`;
      return text;
    },
  );
  if (output !== source) {
    writeFileSync(file, output);
    changed++;
  }
}
console.log(`File aggiornati: ${changed}`);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : path.endsWith('.ts') ? [path] : [];
  });
}
