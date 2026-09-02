import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { primerMensaje } from '../../validadores/mensajes';

@Component({
  selector: 'app-errores',
  imports: [],
  template: `
    @if (mensaje; as texto) {
      <p class="mt-1 text-sm text-red-600">{{ texto }}</p>
    }
  `,
})
export class Errores {
  control = input.required<AbstractControl | null>();

  get mensaje(): string | null {
    const c = this.control();
    if (!c || !c.touched) return null;
    return primerMensaje(c.errors);
  }
}
