import { sql, sqlParams } from './gateway-params';

describe('gateway-params', () => {
  describe('sql.str', () => {
    it('racchiude il testo tra apici', () => {
      expect(sql.str('Pasta frolla')).toBe("'Pasta frolla'");
    });

    it("raddoppia gli apici: l'apostrofo non rompe più la chiamata", () => {
      expect(sql.str("Crème brûlée all'arancia")).toBe("'Crème brûlée all''arancia'");
    });

    it('fa l’escape dei backslash prima degli apici', () => {
      expect(sql.str('C:\\ricette\\')).toBe("'C:\\\\ricette\\\\'");
      expect(sql.str("\\'")).toBe("'\\\\'''");
    });

    it('rimuove i caratteri NUL', () => {
      expect(sql.str('a\0b')).toBe("'ab'");
    });

    it('trasforma null e undefined in stringa vuota (prima finiva nel DB "undefined")', () => {
      expect(sql.str(null)).toBe("''");
      expect(sql.str(undefined)).toBe("''");
    });

    it('accetta numeri', () => {
      expect(sql.str(12)).toBe("'12'");
    });
  });

  describe('sql.num', () => {
    it('formatta i numeri', () => {
      expect(sql.num(12)).toBe('12');
      expect(sql.num(-3.5)).toBe('-3.5');
      expect(sql.num(0)).toBe('0');
    });

    it('accetta le stringhe numeriche delle select e la virgola decimale', () => {
      expect(sql.num('2')).toBe('2');
      expect(sql.num(' 1,25 ')).toBe('1.25');
    });

    it('usa NULL per valori mancanti o non numerici', () => {
      expect(sql.num(null)).toBe('NULL');
      expect(sql.num(undefined)).toBe('NULL');
      expect(sql.num('')).toBe('NULL');
      expect(sql.num('abc')).toBe('NULL');
      expect(sql.num(Number.NaN)).toBe('NULL');
      expect(sql.num(Number.POSITIVE_INFINITY)).toBe('NULL');
    });
  });

  it('sql.bool usa 1/0', () => {
    expect(sql.bool(true)).toBe('1');
    expect(sql.bool(false)).toBe('0');
    expect(sql.bool(null)).toBe('0');
  });

  it('sql.out valida il nome del parametro OUT', () => {
    expect(sql.out('out_id')).toBe('@out_id');
    expect(() => sql.out('x); DROP TABLE ricette; --')).toThrow();
  });

  it('sqlParams produce la stringa posizionale attesa dal gateway', () => {
    expect(sqlParams(sql.num(5), sql.str("l'ultimo"), sql.num(null), sql.out('out_id'))).toBe(
      "5,'l''ultimo',NULL,@out_id",
    );
  });
});
