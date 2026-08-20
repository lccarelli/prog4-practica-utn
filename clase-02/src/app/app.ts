import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Titulo } from './componentes/titulo/titulo';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Titulo],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit, OnDestroy {
  ngOnInit() {
    console.log('[App] ngOnInit');
  }

  // No se ejecuta nunca: el componente raíz sólo se destruye al cerrar la pestaña.
  ngOnDestroy() {
    console.log('[App] ngOnDestroy');
  }
}
