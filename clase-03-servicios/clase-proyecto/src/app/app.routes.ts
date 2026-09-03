import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/catalogo/catalogo').then((m) => m.Catalogo),
    title: 'Catálogo | Rick and Morty',
  },
];
