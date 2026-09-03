import { Routes } from '@angular/router';

const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((m) => m.Login),
    title: 'Ingresar | Rick and Morty',
  },
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro').then((m) => m.Registro),
    title: 'Registro | Rick and Morty',
  },
];

export default authRoutes;
