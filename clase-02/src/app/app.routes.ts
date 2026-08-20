import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/bienvenida/bienvenida').then((m) => m.Bienvenida),
    title: 'Bienvenida | Programación IV',
  },
  {
    path: 'tutoriales',
    loadComponent: () => import('./pages/tutoriales/tutoriales').then((m) => m.Tutoriales),
    title: 'Tutoriales | Programación IV',
  },
  {
    path: 'docs',
    loadComponent: () => import('./pages/documentacion/documentacion').then((m) => m.Documentacion),
    loadChildren: () =>
      import('./pages/documentacion/documentacion.routes').then((m) => m.documentacionRoutes),
    title: 'Documentación | Programación IV',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    title: 'Dashboard | Programación IV',
  },
  {
    path: 'bienvenida',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    // El comodín tiene que quedar último: matchea todo lo que no matcheó antes.
    path: '**',
    loadComponent: () => import('./pages/error/error').then((m) => m.Error),
    title: 'Error | Programación IV',
  },
];
