import { Component } from '@angular/core';
import { Galeria } from './galeria/galeria';

@Component({
  imports: [Galeria],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
