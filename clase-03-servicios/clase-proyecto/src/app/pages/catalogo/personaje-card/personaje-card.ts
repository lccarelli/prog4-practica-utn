import { Component, computed, input, output } from '@angular/core';
import { Personaje } from '../../../interfaces/personaje';

@Component({
  selector: 'app-personaje-card',
  imports: [],
  templateUrl: './personaje-card.html',
  styleUrl: './personaje-card.css',
})
export class PersonajeCard {
  personaje = input.required<Personaje>();
  agregarFavorito = output<Personaje>();

  colorEstado = computed(() => {
    switch (this.personaje().status) {
      case 'Alive':
        return 'bg-emerald-500';
      case 'Dead':
        return 'bg-red-500';
      default:
        return 'bg-slate-400';
    }
  });
}
