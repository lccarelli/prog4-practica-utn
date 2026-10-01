import { TestBed } from '@angular/core/testing';
import { Mazo } from './mazo';

describe('Mazo', () => {
  let servicio: Mazo;

  beforeEach(() => {
    servicio = TestBed.inject(Mazo);
  });

  it('crear() devuelve 52 cartas distintas', () => {
    const mazo = servicio.crear();
    const distintas = new Set(mazo.map((c) => `${c.valor}-${c.palo}`));
    expect(mazo.length).toBe(52);
    expect(distintas.size).toBe(52);
  });

  it('sacar() devuelve una carta y achica el mazo en 1', () => {
    const mazo = servicio.crear();
    const carta = servicio.sacar(mazo);
    expect(mazo.length).toBe(51);
    expect(mazo).not.toContain(carta);
  });
});
