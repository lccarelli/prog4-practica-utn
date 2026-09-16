import { Component } from '@angular/core';
import { FotoDelDia } from './foto-del-dia/foto-del-dia';

@Component({
  imports: [FotoDelDia],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
