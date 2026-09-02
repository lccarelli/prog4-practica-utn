import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Los validadores propios devuelven null si está todo bien, y un objeto
 * { clave: detalle } si falla. La clave es la que después busca el catálogo
 * de mensajes, y el detalle es lo que el mensaje necesita para armarse.
 *
 * Todos dejan pasar el vacío: de eso se ocupa Validators.required.
 */

const vacio = (valor: unknown) => valor === null || valor === undefined || valor === '';

export function entero(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (vacio(control.value)) return null;
    return Number.isInteger(Number(control.value)) ? null : { entero: true };
  };
}

/** Validators.email acepta "a@b". Esto exige además un dominio con punto y TLD de 2+ letras. */
export function dominioConPunto(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (vacio(control.value)) return null;
    const dominio = String(control.value).split('@')[1] ?? '';
    return /\.[a-zA-Z]{2,}$/.test(dominio) ? null : { dominioConPunto: true };
  };
}

export function sinEspacios(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (vacio(control.value)) return null;
    return /\s/.test(String(control.value)) ? { sinEspacios: true } : null;
  };
}

/** Validador de grupo: mira dos campos a la vez, así que no puede vivir en un control. */
export function notaLargaSiEsPerfecto(grupo: AbstractControl): ValidationErrors | null {
  const puntaje = grupo.get('puntaje')?.value;
  const nota = grupo.get('nota')?.value ?? '';

  if (Number(puntaje) !== 5) return null;
  return nota.length >= 30 ? null : { notaCorta: { requerido: 30, actual: nota.length } };
}
