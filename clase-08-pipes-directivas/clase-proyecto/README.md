# Clase 08 — Pipes, directivas y deploy · proyecto

El apunte de la clase está en [`../clase-apunte/apunte.md`](../clase-apunte/apunte.md).

```bash
nvm use
npm ci
npm start        # http://localhost:4200
```

Creado con `ng new`. Los pipes y la directiva salieron de `ng generate pipe` y `ng generate directive`.

## Estructura

```
src/app/
├── pipes/
│   ├── texto-largo-pipe.ts    Corta con "..." (largo opcional, 15 por defecto)
│   └── fecha-pasada-pipe.ts   "hace 3 h", "hace 2 días"
├── directives/
│   └── highlight.ts           appHighlight: resalta al pasar el mouse
├── pipes-demo/                Pipes de Angular y los dos propios
└── directivas-demo/           [class.x], [style.x] y appHighlight
```

## Qué mirar

- **`pipes-demo.ts`**: cada pipe de Angular se importa en el componente. Los datos quedan crudos (la fecha es un string ISO) y se formatean recién en la plantilla.
- **`date: '…' : '-03:00'`**: la fecha está en UTC; sin el offset se vería corrida 3 horas.
- **`texto-largo-pipe.ts`**: el segundo parámetro tiene valor por defecto, así que `| textoLargo` y `| textoLargo: 40` funcionan los dos.
- **`fecha-pasada-pipe.ts`**: el del profe tiene errores de cálculo (los días salen de `horas = 0`, los restos se calculan con `%` del valor equivocado). Este es una versión corta que convierte todo a minutos y va subiendo de unidad.
- **`highlight.ts`**: `host` en vez de `@HostListener`, como quedó en clase. El `input()` se llama igual que el selector, así que se pasa con el propio atributo: `appHighlight="lightblue"` (texto) o `[appHighlight]="colorElegido"` (variable).
- **`highlight.spec.ts`**: el spec que genera el CLI hace `new Highlight()` y falla, porque `inject()` sólo anda dentro de Angular. Se reemplazó por uno que monta la directiva sobre un `<p>` y simula el mouse.

## Deploy

Este proyecto vive en una subcarpeta del repo, así que en Vercel: *Import Git Repository* → **Root Directory** `clase-08-pipes-directivas/clase-proyecto`. Vercel detecta Angular solo. Si no muestra nada, el output directory es `dist/clase-proyecto/browser`. Render, Node y por qué Netlify no: puntos 5 y 6 del apunte.
