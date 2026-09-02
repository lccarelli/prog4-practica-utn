import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Errores } from '../../componentes/errores/errores';
import {
  dominioConPunto,
  entero,
  notaLargaSiEsPerfecto,
  sinEspacios,
} from '../../validadores/validadores';

@Component({
  selector: 'app-formulario',
  imports: [ReactiveFormsModule, Errores],
  templateUrl: './formulario.html',
  styleUrl: './formulario.css',
})
export class Formulario {
  private fb = inject(FormBuilder);

  enviado = signal<string | null>(null);

  formulario = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: [
        '',
        [Validators.required, sinEspacios(), Validators.email, dominioConPunto()],
      ],
      nota: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(280)]],
      puntaje: [
        null as number | null,
        [Validators.required, Validators.min(1), Validators.max(5), entero()],
      ],
      visto: this.fb.group({
        temporada: [null as number | null, [Validators.min(1), Validators.max(5), entero()]],
        episodio: [null as number | null, [Validators.min(1), Validators.max(11), entero()]],
      }),
    },
    { validators: [notaLargaSiEsPerfecto] },
  );

  get nombre() {
    return this.formulario.get('nombre');
  }
  get email() {
    return this.formulario.get('email');
  }
  get nota() {
    return this.formulario.get('nota');
  }
  get puntaje() {
    return this.formulario.get('puntaje');
  }
  get temporada() {
    return this.formulario.get('visto.temporada');
  }
  get episodio() {
    return this.formulario.get('visto.episodio');
  }

  enviar() {
    // Sin esto, un formulario que nunca se tocó se envía vacío y sin mostrar un solo error.
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.enviado.set(null);
      return;
    }

    this.enviado.set(JSON.stringify(this.formulario.value, null, 2));
  }

  limpiar() {
    this.formulario.reset();
    this.enviado.set(null);
  }
}
