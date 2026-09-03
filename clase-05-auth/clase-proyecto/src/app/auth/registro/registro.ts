import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../servicios/auth';
import { Usuario } from '../../interfaces/usuario';
import { Errores } from '../../componentes/errores/errores';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, Errores],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private auth = inject(Auth);
  private router = inject(Router);

  error = signal<string | null>(null);
  revisarCorreo = signal(false);

  formulario = new FormGroup({
    nombre: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  async registrar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { data, error } = await this.auth.registrar(this.formulario.value as Usuario);

    if (error) {
      this.error.set(error.message);
      return;
    }

    if (!data.session) {
      this.revisarCorreo.set(true);
      return;
    }

    this.router.navigateByUrl('/');
  }
}
