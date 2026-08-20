# Clase 01 — Introducción a Angular

Componentes standalone, interpolación, ruteo con `router-outlet` y `routerLink`, redirects y ruta comodín.

Conceptos en [`apuntes/clase-01.md`](../apuntes/clase-01.md).

## Levantarlo

```bash
nvm use
npm ci
npm start        # http://localhost:4200
```

Scripts en el [README de la raíz](../README.md#trabajar-en-una-clase).

## La aplicación

Bienvenida, tutoriales y el error, siguiendo el ejemplo de la cátedra.

```
src/app/
├── app.ts / app.html          Shell: título + navegación + outlet + footer
├── app.routes.ts              Cuatro rutas, todas con component (eager)
│
├── bienvenida/                ''
├── tutoriales/                '/tutoriales'
│   └── card/                  Sin usar; se completa en la clase 03
│
└── componentes/
    ├── titulo/                Interpolación
    └── error/                 '**'
```
