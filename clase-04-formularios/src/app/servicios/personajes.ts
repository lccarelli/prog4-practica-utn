import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Respuesta } from '../interfaces/respuesta';
import { Personaje } from '../interfaces/personaje';

@Injectable({
  providedIn: 'root',
})
export class Personajes {
  private http = inject(HttpClient);
  private readonly apiUrl = 'https://rickandmortyapi.com/api/character';

  getPersonajes() {
    return this.http.get<Respuesta<Personaje>>(this.apiUrl);
  }
}
