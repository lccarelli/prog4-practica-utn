import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Titulo } from './componentes/titulo/titulo';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Titulo],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
