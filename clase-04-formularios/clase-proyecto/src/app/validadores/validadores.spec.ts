import { FormControl, FormGroup, Validators } from '@angular/forms';
import { dominioConPunto, entero, notaLargaSiEsPerfecto, sinEspacios } from './validadores';

describe('entero', () => {
  const validar = (v: unknown) => entero()(new FormControl(v));

  it('deja pasar el vacío', () => {
    expect(validar(null)).toBeNull();
    expect(validar('')).toBeNull();
  });

  it('acepta enteros', () => {
    expect(validar(3)).toBeNull();
    expect(validar('7')).toBeNull();
  });

  it('rechaza decimales y texto', () => {
    expect(validar(3.5)).toEqual({ entero: true });
    expect(validar('abc')).toEqual({ entero: true });
  });
});

describe('sinEspacios', () => {
  const validar = (v: unknown) => sinEspacios()(new FormControl(v));

  it('deja pasar el vacío', () => {
    expect(validar('')).toBeNull();
  });

  it('rechaza cualquier espacio', () => {
    expect(validar('laura @gmail.com')).toEqual({ sinEspacios: true });
    expect(validar(' laura@gmail.com')).toEqual({ sinEspacios: true });
  });

  it('acepta sin espacios', () => {
    expect(validar('laura@gmail.com')).toBeNull();
  });
});

describe('dominioConPunto', () => {
  const validar = (v: unknown) => dominioConPunto()(new FormControl(v));

  it('tapa el agujero de Validators.email', () => {
    // Angular acepta estos dos; nosotros no.
    expect(Validators.email(new FormControl('a@b'))).toBeNull();
    expect(validar('a@b')).toEqual({ dominioConPunto: true });

    expect(Validators.email(new FormControl('laura@gmail.c'))).toBeNull();
    expect(validar('laura@gmail.c')).toEqual({ dominioConPunto: true });
  });

  it('acepta dominios reales', () => {
    expect(validar('laura@gmail.com')).toBeNull();
    expect(validar('laura.carelli@utn.edu.ar')).toBeNull();
  });

  it('deja pasar el vacío', () => {
    expect(validar('')).toBeNull();
  });
});

describe('notaLargaSiEsPerfecto', () => {
  const grupo = (puntaje: number | null, nota: string) =>
    new FormGroup({ puntaje: new FormControl(puntaje), nota: new FormControl(nota) });

  it('no exige nada si el puntaje no es 5', () => {
    expect(notaLargaSiEsPerfecto(grupo(4, 'corta'))).toBeNull();
  });

  it('falla si el puntaje es 5 y la nota es corta', () => {
    expect(notaLargaSiEsPerfecto(grupo(5, 'corta'))).toEqual({
      notaCorta: { requerido: 30, actual: 5 },
    });
  });

  it('pasa si el puntaje es 5 y la nota es larga', () => {
    expect(notaLargaSiEsPerfecto(grupo(5, 'a'.repeat(30)))).toBeNull();
  });
});
