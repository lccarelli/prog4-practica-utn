import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-instalacion',
  styleUrl: './instalacion.css',
  templateUrl: './instalacion.html',
})
export class Instalacion implements OnInit, OnDestroy {
  ngOnInit() {
    console.log('[Instalacion] ngOnInit');
  }

  ngOnDestroy() {
    console.log('[Instalacion] ngOnDestroy');
  }
}
