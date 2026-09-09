import { inject, Service } from '@angular/core';
import { Supabase } from './supabase';
import { Imagen } from '../interfaces/imagen';

@Service()
export class Db {
  private supS = inject(Supabase);

  async traerImagenes() {
    const { data, error } = await this.supS.Sup.from('imagenes').select('*');
    if (error) console.log(error);
    return (data ?? []) as Imagen[];
  }

  async guardarRuta(ruta: string) {
    const { error } = await this.supS.Sup.from('imagenes').insert({ ruta });
    if (error) console.log(error);
  }

  async eliminar(id: number) {
    const { error } = await this.supS.Sup.from('imagenes').delete().eq('id', id);
    if (error) console.log(error);
  }
}
