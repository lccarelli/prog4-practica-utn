import { primerMensaje } from './mensajes';

describe('primerMensaje', () => {
  it('devuelve null si no hay errores', () => {
    expect(primerMensaje(null)).toBeNull();
    expect(primerMensaje(undefined)).toBeNull();
  });

  it('usa el detalle del validador para armar el texto', () => {
    expect(primerMensaje({ minlength: { requiredLength: 3, actualLength: 1 } })).toBe(
      'Necesita al menos 3 caracteres.',
    );
    expect(primerMensaje({ max: { max: 5, actual: 9 } })).toBe('El máximo es 5.');
  });

  it('respeta la prioridad: required gana sobre el resto', () => {
    expect(primerMensaje({ minlength: { requiredLength: 3 }, required: true })).toBe(
      'Este campo es obligatorio.',
    );
  });

  it('prefiere el error propio antes que el genérico de Angular', () => {
    expect(primerMensaje({ email: true, dominioConPunto: true })).toBe(
      'No parece una dirección de correo.',
    );
  });

  it('cae en un texto genérico si la clave es desconocida', () => {
    expect(primerMensaje({ inventado: true })).toBe('El valor no es válido.');
  });
});
