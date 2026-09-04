import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Db } from '../services/db';
import { Supabase } from '../services/supabase';
import { Auto, AutoPorCrear } from '../interfaces/auto';

@Component({
  selector: 'app-autos',
  imports: [ReactiveFormsModule],
  templateUrl: './autos.html',
  styleUrl: './autos.css',
})
export class Autos implements OnInit, OnDestroy {
  private db = inject(Db);
  private supS = inject(Supabase);

  autos = signal<Auto[]>([]);
  private canal?: RealtimeChannel;

  formulario = new FormGroup({
    marca: new FormControl(''),
    modelo: new FormControl(''),
    precio: new FormControl<number | null>(null),
  });

  editando = signal<number | null>(null);

  async ngOnInit() {
    this.autos.set(await this.db.findAll());

    this.canal = this.supS.Sup.channel('autos-cambios')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'autos' }, (payload) => {
        switch (payload.eventType) {
          case 'INSERT':
            this.autos.update((lista) => [...lista, payload.new as Auto]);
            break;
          case 'UPDATE': {
            const i = this.autos().findIndex((a) => a.id === (payload.new as Auto).id);
            const copia = [...this.autos()];
            copia[i] = payload.new as Auto;
            this.autos.set(copia);
            break;
          }
          case 'DELETE': {
            const i = this.autos().findIndex((a) => a.id === (payload.old as Auto).id);
            const copia = [...this.autos()];
            copia.splice(i, 1);
            this.autos.set(copia);
            break;
          }
        }
      })
      .subscribe();
  }

  ngOnDestroy() {
    this.canal?.unsubscribe();
  }

  async guardar() {
    const auto = this.formulario.value as AutoPorCrear;
    const id = this.editando();

    if (id === null) {
      await this.db.create(auto);
    } else {
      await this.db.update(id, auto);
    }

    this.cancelar();
  }

  editar(auto: Auto) {
    this.editando.set(auto.id);
    this.formulario.setValue({ marca: auto.marca, modelo: auto.modelo, precio: auto.precio });
  }

  cancelar() {
    this.editando.set(null);
    this.formulario.reset();
  }

  eliminar(id: number) {
    this.db.delete(id);
  }
}
