import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  // FormsModule es lo que habilita [(ngModel)] en el template.
  imports: [FormsModule],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit, OnDestroy {
  nombre = '';
  contador = signal(0);
  color = '#b8003c';

  get saludo() {
    return this.nombre.trim() === '' ? 'Escribí tu nombre' : `Hola, ${this.nombre}`;
  }

  incrementar() {
    this.contador.update((previo) => previo + 1);
  }

  reiniciar() {
    this.contador.set(0);
  }

  sumar(a: number, b: number) {
    return a + b;
  }

  ngOnInit() {
    console.log('[Dashboard] ngOnInit');
  }

  ngOnDestroy() {
    console.log('[Dashboard] ngOnDestroy');
  }
}
