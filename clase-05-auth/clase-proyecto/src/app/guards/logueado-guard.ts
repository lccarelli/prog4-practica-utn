import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Supabase } from '../servicios/supabase';

export const logueadoGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const supabase = inject(Supabase);

  const { data } = await supabase.Supabase.auth.getSession();
  return data.session ? true : router.parseUrl('/auth/login');
};
