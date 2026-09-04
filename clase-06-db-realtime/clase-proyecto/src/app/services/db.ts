import { inject, Service } from '@angular/core';
import { Supabase } from './supabase';
import { Auto, AutoPorCrear } from '../interfaces/auto';

@Service()
export class Db {
  private supS = inject(Supabase);

  async findAll() {
    const { data, error } = await this.supS.Sup.from('autos').select('*');
    if (error) console.log(error);
    return (data ?? []) as Auto[];
  }

  async create(auto: AutoPorCrear) {
    const { error } = await this.supS.Sup.from('autos').insert(auto);
    if (error) console.log(error);
  }

  async update(id: number, auto: AutoPorCrear) {
    const { error } = await this.supS.Sup.from('autos').update(auto).eq('id', id);
    if (error) console.log(error);
  }

  async delete(id: number) {
    const { error } = await this.supS.Sup.from('autos').delete().eq('id', id);
    if (error) console.log(error);
  }
}
