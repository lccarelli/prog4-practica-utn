import { Component } from '@angular/core';
import { Autos } from './autos/autos';
import { Broadcast } from './broadcast/broadcast';

@Component({
  imports: [Autos, Broadcast],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
