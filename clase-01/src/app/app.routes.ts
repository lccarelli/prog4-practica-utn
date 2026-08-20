import { Routes } from '@angular/router';
import { Bienvenida } from './bienvenida/bienvenida';
import { Tutoriales } from './tutoriales/tutoriales';
import { Error } from './componentes/error/error';

export const routes: Routes = [
  {
    path: '',
    component: Bienvenida,
    title: 'Bienvenida | Programación IV',
  },
  {
    path: 'tutoriales',
    component: Tutoriales,
    title: 'Tutoriales | Programación IV',
  },
  {
    path: 'bienvenida',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    // El comodín tiene que quedar último: matchea todo lo que no matcheó antes.
    path: '**',
    component: Error,
    title: 'Error | Programación IV',
  },
];
