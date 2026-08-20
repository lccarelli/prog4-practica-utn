# Clase 01 — Introducción a Angular

**Fecha:** 18/08/2026 · **Angular:** 22.1.0

## Qué se dio

- Qué es Angular y cómo se instala
- El CLI (`ng`) y sus comandos
- Componentes: el decorador `@Component` y sus cuatro preguntas
- Binding / interpolación
- Ruteo: tabla de rutas, `router-outlet`, `routerLink`, redirects y comodín

---

## 1. Angular y la idea de SPA

Angular es un framework para armar **SPA** (_Single Page Application_). El servidor manda **un solo** `index.html` y, a partir de ahí, JavaScript se encarga de reescribir la pantalla. El navegador nunca vuelve a pedir una página completa.
Eso es lo que hace que el "ruteo" de Angular sea, un **ruteo virtual**: la URL cambia y el contenido cambia, pero no hay ningún pedido nuevo al servidor. Todo pasa en el cliente.
Consecuencia práctica: si en un `<a>` usás `href="/clases"`, rompés la ilusión — el navegador hace un GET real y recarga toda la aplicación. Para eso está `routerLink`.

---

## 2. Instalación

```bash
node -v                       # tiene que ser 22 o 24 (siempre versiones PARES)
npm install -g @angular/cli
ng version                    # verificar que diga 22.x
```

**Por qué versiones pares.** Node numera par = LTS (soporte largo), impar = experimental. Angular 22 declara en su `package.json`:

```
"node": "^22.22.3 || ^24.15.0 || >=26.0.0"
```

Se verifica siempre con `ng version`, mirando el número.

---

## 3. El CLI

```bash
ng new <nombre>              # crea el workspace
ng generate component <ruta> # crea un componente (abreviado: ng g c)
ng serve                     # servidor de desarrollo (abreviado: ng s)
ng build                     # compila a dist/
ng test                      # corre los tests
ng help                      # y --help en cualquier subcomando
```

### Las preguntas del `ng new`

| Pregunta                 | Respuesta de la cátedra |
| ------------------------ | ----------------------- |
| Stylesheet system        | **CSS**                 |
| SSR / SSG (prerendering) | **No**                  |
| Configuración de IA      | **none**                |

Todas se pueden pasar por flag y evitar el modo interactivo:

```bash
ng new mi-app --style=css --ssr=false --ai-config=none --routing
```

---

## 4. Cómo arranca la aplicación

La cadena de arranque, que es lo que el profe resumió en su
`referencias_de_archivos.md`:

```
angular.json        configuración del workspace: qué se compila y cómo
    ↓
index.html          contiene <app-root></app-root> — el agujero donde entra todo
    ↓
main.ts             bootstrapApplication(App, appConfig)
    ↓
app.config.ts       providers globales (el Router entre ellos)
    ↓
app.ts              el componente raíz. Su selector es 'app-root'
    ↓
app.html / app.css  template y estilos del raíz
    ↓
app.routes.ts       la tabla de rutas que consume el Router
```

La clave está en el `selector`. `app.ts` declara `selector: 'app-root'`, y en `index.html` hay un `<app-root></app-root>`. Angular busca ese tag y planta el componente ahí. Es el único punto de contacto entre el HTML estático y Angular.
**En Angular 22 no hay `NgModule`.** Todo es _standalone_: cada componente declara sus propias dependencias. Si viste tutoriales con `app.module.ts` y `declarations: []`, son de Angular 14 o anterior.

---

## 5. Componentes

Un componente son tres archivos (`.ts`, `.html`, `.css`) más una clase con un
decorador.

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-titulo', // ¿Cómo lo instancio?
  imports: [], // ¿Qué otras cosas usa mi template?
  templateUrl: './titulo.html', // ¿Qué renderizo?
  styleUrl: './titulo.css', // ¿Qué estilos?
})
export class Titulo {
  titulo: string = 'CLASE 01';
}
```

Las cuatro propiedades responden cuatro preguntas:
- **`selector`** — el nombre del tag HTML con el que lo usás: `<app-titulo></app-titulo>`. Por convención va con el prefijo `app-`, que se  configura en `angular.json` y evita choques con tags nativos.
- **`imports`** — _acá está el 90% de los errores del principio._ Si tu template usa otro componente o una directiva (`RouterLink`, `RouterOutlet`), tiene que estar en este array. Si no está, Angular no lo reconoce y el tag queda inerte o te tira error de compilación de template.
- **`templateUrl`** — el HTML. La alternativa es `template:` con el HTML inline.
- **`styleUrl`** — el CSS. Ojo: **`styleUrl` en singular** para uno solo, `styleUrls` (array) si tenés varios. Angular 22 genera el singular.
### Encapsulación de estilos

El CSS de un componente **no se escapa**. Angular le agrega un atributo único a los elementos del componente y reescribe los selectores para que apliquen sólo ahí. Si escribís `h1 { color: red }` en `titulo.css`, no afecta a ningún otro `h1` de la aplicación.
Lo global va en `src/styles.css`.
### Composición

Un componente se usa dentro de otro poniendo su selector en el template del
padre, y agregando la clase al `imports` del padre:

```typescript
// app.ts
imports: [Titulo],
```

```html
<!-- app.html -->
<app-titulo></app-titulo>
```

---

## 6. Binding (interpolación)

Conectar un dato de la clase con el template:

```typescript
export class Titulo {
  titulo: string = 'CLASE 01';
}
```

```html
<p>{{ titulo }}</p>
```

Las llaves dobles son **interpolación**: Angular evalúa la expresión y la inserta como **texto**. Cuando el valor cambia, el template se actualiza solo — eso es el binding.

Que sea texto es una defensa: si `titulo` contiene `<script>alert(1)</script>`, se muestra como caracteres literales, no se ejecuta. Angular escapa el HTML por defecto.

Dentro de `{{ }}` van expresiones simples: propiedades, llamadas a métodos, operadores. **No** van asignaciones ni `new`. Y conviene no llamar métodos costosos, porque se reevalúan en cada ciclo de detección de cambios.

---

## 7. Ruteo

### La tabla de rutas

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'clases', component: Clases, title: 'Clases' },
  { path: 'inicio', redirectTo: '', pathMatch: 'full' },
  { path: '**', component: NoEncontrado },
];
```

Cada objeto responde: **¿a qué ruta voy?** (`path`) y **¿qué muestro?** (`component`).

- **`path: ''`** es la raíz, la home.
- **`title`** es opcional y setea el `<title>` de la pestaña. Detalle chico que hace ver la app terminada.
- **`redirectTo`** manda a otra ruta. Sirve para alias y para que una página no tenga dos URLs distintas.
- **`path: '**'`** es el comodín: matchea cualquier URL que no matcheó antes. Es el 404.

### El orden importa (y es la trampa clásica)

El Router recorre el array **de arriba hacia abajo** y se queda con la **primera** coincidencia. Por eso `'**'` va **siempre último**. Si lo ponés primero, se come todas las rutas y sólo ves el 404.

### Dónde se muestra: `router-outlet`

```html
<app-encabezado />

<nav>
  <a routerLink="/clases">Clases</a>
</nav>

<router-outlet />

<footer>...</footer>
```

`<router-outlet>` es el hueco donde el Router inyecta el componente de la ruta actual. Todo lo que pongas **afuera** del outlet se ve **siempre**, en cualquier ruta: es el _shell_ de la aplicación (encabezado, navegación, footer).

Requiere importar `RouterOutlet` en el `imports` del componente.

### Navegar: `routerLink`

```html
<a routerLink="/clases">Clases</a>
```

Requiere importar `RouterLink`. La diferencia con `href` es la del punto 1: `href` recarga toda la aplicación, `routerLink` sólo cambia el outlet.

Se puede poner en cualquier elemento, no sólo en `<a>` — el profe lo usó en `<button>`. Pero para navegación conviene `<a>`: es lo semánticamente correcto y permite abrir en pestaña nueva con ctrl+click.

Para marcar el link activo:

```html
<a routerLink="/" routerLinkActive="activo" [routerLinkActiveOptions]="{ exact: true }">Inicio</a>
```

El `exact: true` en la home es necesario: la ruta `''` es prefijo de todas las demás, así que sin él el link de Inicio queda marcado como activo siempre.

---

## Cosas que confunden

| Síntoma                                             | Causa                                                                     |
| --------------------------------------------------- | ------------------------------------------------------------------------- |
| El tag del componente no renderiza nada             | Falta la clase en el `imports` del componente padre                       |
| `routerLink` no navega, o error de `ActivatedRoute` | Falta importar `RouterLink` en `imports`                                  |
| Todas las rutas muestran el 404                     | La ruta `'**'` quedó antes de las demás                                   |
| El link de Inicio siempre aparece activo            | Falta `[routerLinkActiveOptions]="{ exact: true }"`                       |
| `ng` no existe / versión equivocada                 | Cada versión de Node tiene sus propios paquetes globales                  |
| El CSS de un componente no afecta a otro            | Es correcto: los estilos están encapsulados. Lo global va en `styles.css` |
| Instalé Angular y me quedó la versión anterior      | Node impar: npm bajó a la última compatible sin fallar                    |

---

## Referencia rápida

```typescript
// Componente mínimo
@Component({
  selector: 'app-algo',
  imports: [],
  templateUrl: './algo.html',
  styleUrl: './algo.css',
})
export class Algo {}
```

```typescript
// Ruta con todo
{ path: 'ruta', component: Componente, title: 'Título de la pestaña' }
{ path: 'vieja', redirectTo: 'nueva', pathMatch: 'full' }
{ path: '**', component: NoEncontrado }   // SIEMPRE último
```

```html
{{ propiedad }}
<!-- interpolación -->
<router-outlet />
<!-- necesita RouterOutlet en imports -->
<a routerLink="/ruta"> <!-- necesita RouterLink en imports --></a>
```

