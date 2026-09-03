import { Component, computed, input } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { primerMensaje } from '../../validadores/mensajes';

@Component({
  selector: 'app-errores',
  imports: [],
  template: `
    @if (mensaje(); as texto) {
      <p class="mt-1 text-sm text-red-600">{{ texto }}</p>
    }
  `,
})
export class Errores {
  errores = input<ValidationErrors | null | undefined>();

  mensaje = computed(() => primerMensaje(this.errores()));
}
