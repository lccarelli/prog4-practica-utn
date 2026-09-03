import { inject, Service, signal } from '@angular/core';
import { User } from '@supabase/supabase-js';
import { Usuario } from '../interfaces/usuario';
import { Supabase } from './supabase';

@Service()
export class Auth {
  private supabaseS = inject(Supabase);

  usuarioActual = signal<User | null>(null);

  constructor() {
    this.supabaseS.Supabase.auth.onAuthStateChange((event, session) => {
      this.usuarioActual.set(session?.user ?? null);
    });
  }

  async registrar(usuario: Usuario) {
    return await this.supabaseS.Supabase.auth.signUp({
      email: usuario.email,
      password: usuario.password,
      options: {
        data: { nombre: usuario.nombre },
      },
    });
  }

  async loguear(usuario: Usuario) {
    return await this.supabaseS.Supabase.auth.signInWithPassword({
      email: usuario.email,
      password: usuario.password,
    });
  }

  async cerrarSesion() {
    return await this.supabaseS.Supabase.auth.signOut();
  }
}
