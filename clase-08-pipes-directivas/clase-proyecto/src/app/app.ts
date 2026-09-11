import { Component } from '@angular/core';
import { PipesDemo } from './pipes-demo/pipes-demo';
import { DirectivasDemo } from './directivas-demo/directivas-demo';

@Component({
  imports: [PipesDemo, DirectivasDemo],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
