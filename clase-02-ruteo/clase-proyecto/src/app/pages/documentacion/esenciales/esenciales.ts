import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-esenciales',
  styleUrl: './esenciales.css',
  templateUrl: './esenciales.html',
})
export class Esenciales implements OnInit, OnDestroy {
  ngOnInit() {
    console.log('[Esenciales] ngOnInit');
  }

  ngOnDestroy() {
    console.log('[Esenciales] ngOnDestroy');
  }
}
