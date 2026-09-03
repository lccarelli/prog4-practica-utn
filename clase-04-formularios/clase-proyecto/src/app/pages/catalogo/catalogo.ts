import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { Personajes } from '../../servicios/personajes';
import { Personaje } from '../../interfaces/personaje';
import { PersonajeCard } from './personaje-card/personaje-card';

@Component({
  selector: 'app-catalogo',
  imports: [PersonajeCard],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo implements OnInit, OnDestroy {
  private servicio = inject(Personajes);

  personajes = signal<Personaje[]>([]);
  total = signal(0);
  cargando = signal(true);
  error = signal<string | null>(null);

  private suscripcion?: Subscription;

  ngOnInit() {
    this.suscripcion = this.servicio.getPersonajes().subscribe({
      next: (respuesta) => {
        this.personajes.set(respuesta.results);
        this.total.set(respuesta.info.count);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('No pudimos traer los personajes.');
        this.cargando.set(false);
      },
    });
  }

  ngOnDestroy() {
    this.suscripcion?.unsubscribe();
  }
}
