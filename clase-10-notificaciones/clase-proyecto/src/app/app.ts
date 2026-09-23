import { Component } from '@angular/core';
import { Suscripcion } from './suscripcion/suscripcion';

@Component({
  imports: [Suscripcion],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
