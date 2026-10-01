import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Mazo } from '../services/mazo';
import { Carta } from '../interfaces/carta';

@Component({
  selector: 'app-mayor-o-menor',
  imports: [],
  templateUrl: './mayor-o-menor.html',
  styleUrl: './mayor-o-menor.css',
})
export class MayorOMenor implements OnInit, OnDestroy {
  private mazoS = inject(Mazo);
  private mazo: Carta[] = [];
  private intervalo?: ReturnType<typeof setInterval>;

  actual = signal<Carta | null>(null);
  vidas = signal(3);
  puntos = signal(0);
  segundos = signal(0);
  terminada = signal(false);
  restantes = signal(0);

  ngOnInit() {
    this.iniciar();
  }

  ngOnDestroy() {
    clearInterval(this.intervalo);
  }

  iniciar() {
    clearInterval(this.intervalo);
    this.mazo = this.mazoS.crear();
    this.actual.set(this.mazoS.sacar(this.mazo));
    this.restantes.set(this.mazo.length);
    this.vidas.set(3);
    this.puntos.set(0);
    this.segundos.set(0);
    this.terminada.set(false);
    this.intervalo = setInterval(() => this.segundos.update((s) => s + 1), 1000);
  }

  elegir(eleccion: 'mayor' | 'menor') {
    const anterior = this.actual()!;
    const nueva = this.mazoS.sacar(this.mazo);

    if (nueva.valor !== anterior.valor) {
      const acerto =
        eleccion === 'mayor' ? nueva.valor > anterior.valor : nueva.valor < anterior.valor;
      if (acerto) {
        this.puntos.update((p) => p + 1);
      } else {
        this.vidas.update((v) => v - 1);
      }
    }

    this.actual.set(nueva);
    this.restantes.set(this.mazo.length);

    if (this.vidas() === 0 || this.mazo.length === 0) {
      this.terminar();
    }
  }

  terminar() {
    this.terminada.set(true);
    clearInterval(this.intervalo);
  }

  nombre(carta: Carta) {
    const figuras: Record<number, string> = { 1: 'As', 11: 'J', 12: 'Q', 13: 'K' };
    return `${figuras[carta.valor] ?? carta.valor} de ${carta.palo}`;
  }
}
