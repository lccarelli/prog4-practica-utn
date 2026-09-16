import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../environments/environment';
import { Loading } from '../services/loading';
import { Apod } from '../interfaces/apod';

@Component({
  selector: 'app-foto-del-dia',
  imports: [FormsModule],
  templateUrl: './foto-del-dia.html',
  styleUrl: './foto-del-dia.css',
})
export class FotoDelDia {
  private http = inject(HttpClient);
  loading = inject(Loading);

  fecha = '';
  apod = signal<Apod | null>(null);
  error = signal<string | null>(null);

  traer() {
    this.http.get<Apod>(environment.NASA_URL, { params: { date: this.fecha } }).subscribe({
      next: (respuesta) => {
        this.apod.set(respuesta);
        this.error.set(null);
      },
      error: () => {
        this.loading.cargando.set(false);
        this.error.set('La NASA no respondió. Con DEMO_KEY hay un límite de pedidos por hora.');
      },
    });
  }
}
