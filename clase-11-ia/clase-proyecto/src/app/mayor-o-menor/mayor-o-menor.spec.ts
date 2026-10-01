import { TestBed } from '@angular/core/testing';
import { MayorOMenor } from './mayor-o-menor';

describe('MayorOMenor', () => {
  let juego: MayorOMenor;

  beforeEach(() => {
    juego = TestBed.createComponent(MayorOMenor).componentInstance;
    juego.iniciar();
  });

  afterEach(() => {
    juego.ngOnDestroy();
    vi.restoreAllMocks();
  });

  function siguiente(valor: number) {
    juego['mazo'] = [
      { valor, palo: 'picas' },
      { valor: 1, palo: 'tréboles' },
    ];
    vi.spyOn(Math, 'random').mockReturnValue(0);
  }

  it('arranca con 3 vidas, 0 puntos y 51 cartas en el mazo', () => {
    expect(juego.vidas()).toBe(3);
    expect(juego.puntos()).toBe(0);
    expect(juego.restantes()).toBe(51);
  });

  it('acertar suma un punto', () => {
    juego.actual.set({ valor: 5, palo: 'corazones' });
    siguiente(9);
    juego.elegir('mayor');
    expect(juego.puntos()).toBe(1);
    expect(juego.vidas()).toBe(3);
  });

  it('errar resta una vida', () => {
    juego.actual.set({ valor: 5, palo: 'corazones' });
    siguiente(9);
    juego.elegir('menor');
    expect(juego.vidas()).toBe(2);
  });

  it('el mismo valor no cambia nada', () => {
    juego.actual.set({ valor: 5, palo: 'corazones' });
    siguiente(5);
    juego.elegir('mayor');
    expect(juego.puntos()).toBe(0);
    expect(juego.vidas()).toBe(3);
  });

  it('sin vidas termina la partida', () => {
    juego.vidas.set(1);
    juego.actual.set({ valor: 5, palo: 'corazones' });
    siguiente(9);
    juego.elegir('menor');
    expect(juego.terminada()).toBe(true);
  });
});
