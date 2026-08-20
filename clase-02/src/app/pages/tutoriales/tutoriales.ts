import { Component, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { Card } from './components/card/card';

@Component({
  imports: [Card],
  selector: 'app-tutoriales',
  styleUrl: './tutoriales.css',
  templateUrl: './tutoriales.html',
})
export class Tutoriales implements OnInit, OnDestroy {
  contador: WritableSignal<number> = signal(0);
  imagen = 'img/angular.svg';

  private intervalo?: ReturnType<typeof setInterval>;

  contar() {
    this.contador.update((previo) => previo + 1);
  }

  reiniciar() {
    this.contador.set(0);
  }

  ngOnInit() {
    this.intervalo = setInterval(() => this.contar(), 1000);
  }

  // Sin este clearInterval el intervalo sigue corriendo después de salir de la página.
  ngOnDestroy() {
    clearInterval(this.intervalo);
  }
}
