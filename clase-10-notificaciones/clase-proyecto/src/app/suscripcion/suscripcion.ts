import { Component, inject, signal } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { Supabase } from '../services/supabase';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-suscripcion',
  imports: [],
  templateUrl: './suscripcion.html',
  styleUrl: './suscripcion.css',
})
export class Suscripcion {
  swPush = inject(SwPush);
  private supS = inject(Supabase);

  estado = signal<'pregunta' | 'suscripto' | 'rechazado' | 'error'>('pregunta');

  async registrar() {
    if (!this.swPush.isEnabled) {
      console.log('SW no está encendido');
      return;
    }

    let suscripcion: PushSubscription;
    try {
      suscripcion = await this.swPush.requestSubscription({
        serverPublicKey: environment.VAPID_PUBLIC,
      });
    } catch {
      this.estado.set('rechazado');
      return;
    }

    const json = suscripcion.toJSON();
    const { error } = await this.supS.Sup.from('suscripciones_notificaciones').insert({
      endpoint: json.endpoint,
      auth: json.keys?.['auth'],
      p256dh: json.keys?.['p256dh'],
    });

    this.estado.set(error ? 'error' : 'suscripto');
  }
}
