import { Routes } from '@angular/router';
import { Instalacion } from './instalacion/instalacion';
import { Esenciales } from './esenciales/esenciales';

export const documentacionRoutes: Routes = [
  {
    path: 'instalacion',
    component: Instalacion,
    title: 'Instalación | Documentación',
  },
  {
    path: 'esenciales',
    component: Esenciales,
    title: 'Esenciales | Documentación',
  },
  {
    path: '',
    redirectTo: 'instalacion',
    pathMatch: 'full',
  },
];
