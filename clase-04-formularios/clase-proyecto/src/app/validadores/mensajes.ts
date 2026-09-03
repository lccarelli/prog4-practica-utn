import { ValidationErrors } from '@angular/forms';

/** Lo que dejan los validadores en el objeto de error. Todo opcional: cada uno pone lo suyo. */
interface DetalleError {
  requiredLength?: number;
  actualLength?: number;
  min?: number;
  max?: number;
  actual?: number;
  requerido?: number;
}

/**
 * Un mensaje por clave de error. Cada función recibe el detalle que dejó el
 * validador, así el texto puede usar los números reales en vez de repetirlos.
 *
 * Ojo con las claves de Angular: minlength y maxlength van en minúscula,
 * aunque los validadores se llamen minLength y maxLength.
 */
const MENSAJES: Record<string, (detalle: DetalleError) => string> = {
  required: () => 'Este campo es obligatorio.',
  minlength: (d) => `Necesita al menos ${d.requiredLength} caracteres.`,
  maxlength: (d) => `No puede superar los ${d.requiredLength} caracteres.`,
  min: (d) => `El mínimo es ${d.min}.`,
  max: (d) => `El máximo es ${d.max}.`,
  email: () => 'No parece una dirección de correo.',
  pattern: () => 'El formato no es válido.',
  entero: () => 'Tiene que ser un número entero.',
  dominioConPunto: () => 'Falta el dominio. Por ejemplo: nombre@gmail.com',
  sinEspacios: () => 'No puede tener espacios.',
  notaCorta: (d) => `Un puntaje de 5 necesita ${d.requerido} caracteres. Llevás ${d.actual}.`,
};

/** El orden de las claves define la prioridad: se muestra el primero que matchea. */
const PRIORIDAD = [
  'required',
  'sinEspacios',
  'entero',
  'email',
  'dominioConPunto',
  'pattern',
  'minlength',
  'maxlength',
  'min',
  'max',
  'notaCorta',
];

export function primerMensaje(errores: ValidationErrors | null | undefined): string | null {
  if (!errores) return null;

  const clave =
    PRIORIDAD.find((c) => c in errores) ?? Object.keys(errores).find((c) => c in MENSAJES);

  if (!clave) return 'El valor no es válido.';
  return MENSAJES[clave](errores[clave]);
}
