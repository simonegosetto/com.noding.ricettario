import { PROCESS } from './gateway-processes';

describe('catalogo dei process', () => {
  const processes = Object.values(PROCESS);

  it('contiene i 58 process usati dal frontend', () => {
    expect(processes).toHaveLength(58);
  });

  it('ha id univoci e non vuoti', () => {
    const ids = processes.map((process) => process.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => id.length > 40)).toBe(true);
  });

  it('associa a ogni voce il suo nome', () => {
    for (const [name, process] of Object.entries(PROCESS)) {
      expect(process.name).toBe(name);
    }
  });

  it('classifica come scritture i process che modificano i dati', () => {
    const writes = processes.filter((process) => process.kind === 'write').map((p) => p.name);
    expect(writes).toContain('RICETTA_SAVE');
    expect(writes).toContain('ARCHIVIO_FILE_DELETE');
    expect(writes.every((name) => /SAVE|INSERT|UPDATE|DELETE|MOVE|RENAME|ADD/.test(name))).toBe(
      true,
    );
    expect(processes.filter((process) => process.kind === 'read')).toHaveLength(25);
  });
});
