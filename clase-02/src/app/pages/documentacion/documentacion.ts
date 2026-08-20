import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-documentacion',
  styleUrl: './documentacion.css',
  templateUrl: './documentacion.html',
})
export class Documentacion implements OnInit, OnDestroy {
  ngOnInit() {
    console.log('[Documentacion] ngOnInit');
  }

  ngOnDestroy() {
    console.log('[Documentacion] ngOnDestroy');
  }
}
