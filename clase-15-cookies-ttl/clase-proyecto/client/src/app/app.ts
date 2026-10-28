import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  http = inject(HttpClient);
  respuesta = signal('');

  registrarse() {
    this.http
      .post<{ token: string }>(`${environment.API_URL}/auth/registro`, {
        user: 'laura',
        pass: '1234',
      })
      .subscribe((data) => {
        localStorage.setItem('token', data.token);
        this.respuesta.set('Registrada. Token guardado.');
      });
  }

  login() {
    this.http
      .post<{ token: string }>(`${environment.API_URL}/auth/login`, { user: 'laura', pass: '1234' })
      .subscribe((data) => {
        localStorage.setItem('token', data.token);
        this.respuesta.set('Logueada. Token guardado.');
      });
  }

  traer() {
    this.http.get<{ mensaje: string }>(`${environment.API_URL}/dibujo`).subscribe({
      next: (data) => this.respuesta.set(data.mensaje),
      error: (err) => this.respuesta.set(`Error ${err.status}`),
    });
  }

  borrarToken() {
    localStorage.removeItem('token');
    this.respuesta.set('Token borrado del localStorage (la cookie sigue).');
  }
}
