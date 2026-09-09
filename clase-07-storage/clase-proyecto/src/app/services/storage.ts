import { inject, Service } from '@angular/core';
import { Supabase } from './supabase';

@Service()
export class Storage {
  private supS = inject(Supabase);

  async subir(archivo: File) {
    const ruta = `galeria/${Date.now()}.${archivo.type.split('/')[1]}`;
    const { error } = await this.supS.Sup.storage.from('imagenes').upload(ruta, archivo);

    if (error) {
      console.log(error);
      return null;
    }

    return ruta;
  }

  urlPublica(ruta: string) {
    return this.supS.Sup.storage.from('imagenes').getPublicUrl(ruta).data.publicUrl;
  }

  async eliminar(ruta: string) {
    const { error } = await this.supS.Sup.storage.from('imagenes').remove([ruta]);
    if (error) console.log(error);
  }
}
