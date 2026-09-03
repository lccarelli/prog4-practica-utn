import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/catalogo/catalogo').then((m) => m.Catalogo),
    title: 'Catálogo | Rick and Morty',
  },
  {
    path: 'formulario',
    loadComponent: () => import('./pages/formulario/formulario').then((m) => m.Formulario),
    title: 'Formulario | Rick and Morty',
  },
  {
    path: 'episodios',
    loadComponent: () => import('./pages/episodios/episodios').then((m) => m.Episodios),
    title: 'Episodios | Rick and Morty',
  },
];
