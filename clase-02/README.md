# Clase 02 — Ruteo, componentes y variables

Lazy loading, rutas hijas, ciclo de vida, tipos de bindeo, signals y `FormsModule`.

Conceptos en [`apuntes/clase-02.md`](../apuntes/clase-02.md).

## Levantarlo

```bash
nvm use
npm ci
npm start        # http://localhost:4200
```

Abrí la consola del navegador y navegá entre páginas para ver los hooks.

## La aplicación

```
src/app/
├── app.ts / app.html          Shell + hooks de ciclo de vida
├── app.routes.ts              Todas las rutas con loadComponent
│
├── pages/
│   ├── bienvenida/            ''
│   ├── tutoriales/            '/tutoriales' — signals y ciclo de vida
│   │   └── components/card/   Sin usar; se completa en la clase 03
│   ├── documentacion/         '/docs' — padre con outlet anidado
│   │   ├── documentacion.routes.ts
│   │   ├── instalacion/       '/docs/instalacion'
│   │   └── esenciales/        '/docs/esenciales'
│   ├── dashboard/             '/dashboard' — los cuatro tipos de bindeo
│   └── error/                 '**'
│
└── componentes/
    └── titulo/
```

El `public/img/angular.svg` es el asset del bindeo de atributo `[src]`.

## Qué mirar

- **`app.routes.ts`**: ninguna ruta usa `component`, todas `loadComponent`. El
  `ng build` genera un chunk por página.
- **`documentacion/`**: `loadChildren` apunta a `documentacion.routes.ts`, y el
  template del padre tiene su propio `<router-outlet>`. Al moverse entre
  `instalacion` y `esenciales` el padre no se remonta.
- **`tutoriales/`**: el contador es un `signal`, y un `setInterval` de
  `ngOnInit` lo incrementa. El `clearInterval` de `ngOnDestroy` es lo que evita
  que el intervalo siga corriendo después de salir.
- **`dashboard/`**: interpolación, `[prop]`, `(evento)` y `[(ngModel)]`, un
  bloque por tipo.
- **`app.ts`**: el `ngOnDestroy` del raíz no se ejecuta nunca.
