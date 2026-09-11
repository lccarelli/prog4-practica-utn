import { Component, signal } from '@angular/core';
import { Highlight } from '../directives/highlight';

@Component({
  selector: 'app-directivas-demo',
  imports: [Highlight],
  templateUrl: './directivas-demo.html',
  styleUrl: './directivas-demo.css',
})
export class DirectivasDemo {
  esRojo = signal(false);
  esNegrita = signal(false);
  colorElegido = 'lightgreen';
}
