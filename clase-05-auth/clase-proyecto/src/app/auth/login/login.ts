import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../servicios/auth';
import { Usuario } from '../../interfaces/usuario';
import { Errores } from '../../componentes/errores/errores';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Errores],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private auth = inject(Auth);
  private router = inject(Router);

  error = signal<string | null>(null);

  formulario = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  async ingresar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { error } = await this.auth.loguear(this.formulario.value as Usuario);

    if (error) {
      this.error.set(error.message);
      return;
    }

    this.router.navigateByUrl('/');
  }
}
