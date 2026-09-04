import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Supabase } from '../services/supabase';

@Component({
  selector: 'app-broadcast',
  imports: [],
  templateUrl: './broadcast.html',
  styleUrl: './broadcast.css',
})
export class Broadcast implements OnInit, OnDestroy {
  private supS = inject(Supabase);

  recibidos = signal<string[]>([]);
  private canal?: RealtimeChannel;

  ngOnInit() {
    this.canal = this.supS.Sup.channel('saludos')
      .on('broadcast', { event: 'saludo' }, (mensaje) => {
        this.recibidos.update((lista) => [...lista, mensaje['payload'].texto]);
      })
      .subscribe();
  }

  ngOnDestroy() {
    this.canal?.unsubscribe();
  }

  saludar() {
    this.canal?.send({
      type: 'broadcast',
      event: 'saludo',
      payload: { texto: 'Hola desde otra pestaña' },
    });
  }
}
