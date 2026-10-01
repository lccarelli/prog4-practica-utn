import { Component } from '@angular/core';
import { MayorOMenor } from './mayor-o-menor/mayor-o-menor';

@Component({
  imports: [MayorOMenor],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
