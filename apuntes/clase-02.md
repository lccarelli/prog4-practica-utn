# Clase 02 — Ruteo, componentes y variables

**Fecha:** 20/08/2026 · **Angular:** 22.1.0

## Qué se dio

- Ruteo complejo: rutas hijas
- Lazy loading
- Ciclo de vida del componente
- Tipos de bindeos
- Signals
- `FormsModule`

---

## 1. Lazy loading

En la clase 01 las rutas apuntaban al componente directo:

```typescript
import { Bienvenida } from './pages/bienvenida/bienvenida';

{ path: '', component: Bienvenida }
```

Ese `import` de arriba obliga al bundler a meter `Bienvenida` en el archivo principal. Con cuatro páginas el usuario se descarga las cuatro aunque visite una sola.

La versión diferida:

```typescript
{
  path: '',
  loadComponent: () => import('./pages/bienvenida/bienvenida').then((m) => m.Bienvenida),
}
```

Tres cambios:

- **Desaparece el `import` de arriba.** Si queda, no sirve de nada: el componente vuelve al bundle principal.
- **`component` pasa a `loadComponent`**, que recibe una función.
- **El `import(...)` de adentro es dinámico.** Devuelve una promesa y el bundler lo usa como punto de corte para generar un archivo aparte.

El `.then((m) => m.Bienvenida)` saca la clase del módulo importado. La `m` es el
módulo entero; se podría llamar de cualquier forma.

### Cómo se comprueba

En el `ng build`, cada ruta diferida aparece como *lazy chunk*:

```
Lazy chunk files    | Names                |  Raw size
chunk-DdfNdko5.js   | dashboard            |  32.11 kB
chunk-DA59thTc.js   | documentacion-routes |   1.67 kB
chunk-B6OcBXOE.js   | tutoriales           |   1.56 kB
chunk-DXIyrWLM.js   | documentacion        |   1.34 kB
chunk-D7gwxITz.js   | error                | 549 bytes
chunk-CIMm0gtC.js   | bienvenida           | 497 bytes
```

`dashboard` pesa 32 kB contra menos de 2 kB del resto porque importa `FormsModule`. Ese peso sólo se descarga si el usuario entra a `/dashboard`. Es justamente lo que el lazy loading compra.

También se ve en la pestaña Network del navegador: al hacer clic en un link aparece un pedido de un `.js` nuevo, que la segunda vez ya no se repite.

---

## 2. Rutas hijas

Una página que tiene su propio menú interno y su propio outlet.

```typescript
// app.routes.ts
{
  path: 'docs',
  loadComponent: () => import('./pages/documentacion/documentacion').then((m) => m.Documentacion),
  loadChildren: () =>
    import('./pages/documentacion/documentacion.routes').then((m) => m.documentacionRoutes),
}
```

```typescript
// pages/documentacion/documentacion.routes.ts
export const documentacionRoutes: Routes = [
  { path: 'instalacion', component: Instalacion },
  { path: 'esenciales', component: Esenciales },
  { path: '', redirectTo: 'instalacion', pathMatch: 'full' },
];
```

`loadComponent` carga el **padre** y `loadChildren` carga la **tabla de rutas de los hijos**, en dos chunks distintos.

Se puede escribir `children: documentacionRoutes` con el import arriba, pero entonces las rutas hijas viajan en el chunk del padre. `loadChildren` las separa.

### El outlet anidado

El template del padre necesita su propio `<router-outlet>`:

```html
<h2>Documentación</h2>

<nav>
  <a routerLink="instalacion">Instalación</a>
  <a routerLink="esenciales">Esenciales</a>
</nav>

<router-outlet />
```

Quedan **dos outlets activos**: el de `app.html` muestra a `Documentacion`, y el de `documentacion.html` muestra a `Instalacion` o `Esenciales`.

Los `routerLink` de los hijos van **sin barra inicial**: `"instalacion"` es relativo y arma `/docs/instalacion`. Con `"/instalacion"` iría a la raíz y caería en el comodín.

### La ruta vacía del hijo

Sin el `{ path: '', redirectTo: 'instalacion' }`, entrar a `/docs` muestra el padre con el outlet vacío. Ese redirect elige qué hijo aparece por defecto.

---

## 3. Ciclo de vida

Angular avisa al componente en momentos determinados. Los dos de esta clase:

```typescript
export class Documentacion implements OnInit, OnDestroy {
  ngOnInit() {
    console.log('[Documentacion] ngOnInit');
  }

  ngOnDestroy() {
    console.log('[Documentacion] ngOnDestroy');
  }
}
```

- **`ngOnInit`** — una vez, después de crear el componente y resolver sus inputs. Es donde va la inicialización, no en el `constructor`: ahí los inputs todavía no llegaron.
- **`ngOnDestroy`** — justo antes de destruirlo. Sirve para limpiar suscripciones, `setInterval` y listeners que de otro modo quedan vivos.

### Implementar la interfaz

El `implements OnInit, OnDestroy` no es obligatorio para que Angular llame al método, pero conviene: si escribís `ngOnInt()` sin la interfaz, TypeScript no dice nada y el hook nunca se ejecuta. Con la interfaz, no compila.

ESLint lo pide con la regla `@angular-eslint/use-lifecycle-interface`.

### Para qué sirve `ngOnDestroy`: el intervalo

El ejemplo que lo vuelve concreto. Un componente que arranca un `setInterval`:

```typescript
export class Tutoriales implements OnInit, OnDestroy {
  contador = signal(0);
  private intervalo?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.intervalo = setInterval(() => this.contar(), 1000);
  }

  ngOnDestroy() {
    clearInterval(this.intervalo);
  }
}
```

Sin el `clearInterval`, al salir de la página el componente se destruye pero **el intervalo sigue corriendo**: cada segundo ejecuta un callback que apunta a un componente que ya no existe. Entrando y saliendo cinco veces quedan cinco intervalos vivos. Eso es una fuga de memoria, y es la razón de ser del hook.

Lo mismo vale para `addEventListener` y para las suscripciones a observables.

### Lo que se ve navegando

Con la consola abierta, moviéndose entre las páginas:

- Al entrar a una ruta se dispara su `ngOnInit`.
- Al salir, su `ngOnDestroy`.
- Al moverse entre `instalacion` y `esenciales`, se crean y destruyen los hijos, pero el padre `Documentacion` **no se vuelve a montar**: no vuelve a loguear `ngOnInit`. Eso es lo que hace útil el anidamiento.
- **`ngOnDestroy` del componente raíz nunca se ejecuta.** El `App` sólo se destruye al cerrar la pestaña, y ahí ya no hay a quién avisarle.

---

## 4. Tipos de bindeo

Cuatro formas, que se distinguen por la dirección y por la sintaxis.

| Sintaxis          | Dirección           | Para qué                                    |
| ----------------- | ------------------- | ------------------------------------------- |
| `{{ dato }}`      | clase → template    | Mostrar un valor como texto                 |
| `[prop]="dato"`   | clase → template    | Setear una propiedad del elemento           |
| `(evento)="fn()"` | template → clase    | Reaccionar a algo que hizo el usuario       |
| `[(ngModel)]`     | en los dos sentidos | Sincronizar un input con una propiedad      |

### Interpolación

```html
<p>2 + 3 = {{ sumar(2, 3) }}</p>
```

Inserta el resultado como texto. Angular escapa el HTML, así que un `<script>` se muestra literal.

### Propiedad

```html
<p [style.color]="color">Texto</p>
<button [disabled]="contador() === 0">Reiniciar</button>
<img [src]="imagen" width="60" alt="Logo" />
```

Los corchetes cambian el significado: `disabled="contador() === 0"` (sin corchetes) pasaría el **string literal**, y en HTML cualquier valor de `disabled` deshabilita. Con corchetes, Angular evalúa la expresión.

El `[src]` de la imagen es el mismo mecanismo: la ruta sale de una propiedad de la clase en lugar de estar escrita en el HTML. El archivo va en `public/`, y ahí `public/img/angular.svg` se referencia como `'img/angular.svg'` — el contenido de `public/` termina en la raíz del build.

### Evento

```html
<button (click)="incrementar()">Sumar uno</button>
```

Los paréntesis escuchan un evento del DOM. Dentro está disponible `$event` con el objeto del evento.

### Bidireccional

```html
<input [(ngModel)]="nombre" name="nombre" />
<p>{{ nombre }}</p>
```

Es azúcar sintáctica de las dos anteriores juntas: `[ngModel]` escribe del componente al input y `(ngModelChange)` del input al componente. Los símbolos `[()]` se recuerdan como *banana in a box*.

---

## 5. Signals

Un signal es un valor que **avisa** cuando cambia. Angular lo usa para saber qué parte de la pantalla volver a renderizar, en lugar de revisar todo.

```typescript
import { signal, WritableSignal } from '@angular/core';

contador: WritableSignal<number> = signal(0);
```

El tipo se puede omitir: `contador = signal(0)` ya infiere `WritableSignal<number>`.

### Las tres operaciones

```typescript
this.contador(); // leer — se invoca como una función
this.contador.set(10); // reemplazar el valor
this.contador.update((previo) => previo + 1); // derivar del anterior
```

`set` cuando el nuevo valor no depende del viejo; `update` cuando sí.

### En el template

```html
<p>Contador: {{ contador() }}</p>
```

**Los paréntesis son obligatorios.** Sin ellos, `{{ contador }}` no da error: imprime la representación de la función, algo como `function computed(...)`. Es un bug silencioso, y es el error más común al empezar.

### Por qué importa

Angular 22 es **zoneless** por defecto: ya no viene `zone.js`, que era la librería que parcheaba `setTimeout`, `addEventListener` y compañía para detectar que algo pudo haber cambiado.

Sin zone.js, Angular necesita que le avisen. Los eventos del template (`(click)`) avisan solos, pero un valor que cambia desde un `setInterval` no. Con un signal sí, porque el `.set()` es el aviso.

Se nota en los tests: asignar `component.contador = 5` a una propiedad común desde afuera del template **no refresca la vista**. Con un signal, sí.

Por eso conviene que el estado del componente sean signals, y no propiedades comunes.

---

## 6. FormsModule

`ngModel` no viene en el core. Hay que importarlo en el componente:

```typescript
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  ...
})
```

Sin eso, `[(ngModel)]` no falla de forma obvia: Angular avisa que `ngModel` no es una propiedad conocida de `input`, y el binding queda muerto.

El `name` en el input es necesario cuando está dentro de un `<form>`.

---

## Cosas que confunden

| Síntoma | Causa |
| ------- | ----- |
| No se genera el lazy chunk | Quedó el `import` estático arriba del archivo |
| `/docs` muestra el padre vacío | Falta el `{ path: '', redirectTo: ... }` en las hijas |
| El link del hijo salta al 404 | El `routerLink` lleva barra inicial y se volvió absoluto |
| El hijo no aparece | Falta el `<router-outlet>` en el template del padre |
| El hook nunca corre | Está mal escrito el nombre y falta el `implements` |
| `ngOnDestroy` del App no aparece | Es correcto: el raíz no se destruye |
| `ngModel` no es propiedad conocida | Falta `FormsModule` en los `imports` |
| El botón queda siempre deshabilitado | Se escribió `disabled="..."` sin corchetes |
| El padre se remonta al cambiar de hijo | Las rutas se declararon planas y no como hijas |
| Se imprime `function computed(...)` | Falta invocar el signal: va `contador()`, no `contador` |
| El contador avanza aunque salí de la página | Falta el `clearInterval` en `ngOnDestroy` |
| Cambio un valor y la vista no se actualiza | Es una propiedad común mutada fuera de un evento; usar un signal |
| La imagen no carga | La ruta no es relativa a `public/`, o falta el archivo |

---

## Referencia rápida

```typescript
// Ruta diferida
{ path: 'algo', loadComponent: () => import('./pages/algo/algo').then((m) => m.Algo) }

// Ruta con hijas diferidas
{
  path: 'padre',
  loadComponent: () => import('./pages/padre/padre').then((m) => m.Padre),
  loadChildren: () => import('./pages/padre/padre.routes').then((m) => m.padreRoutes),
}

// Hooks
export class Algo implements OnInit, OnDestroy {
  ngOnInit() {}
  ngOnDestroy() {}
}

// Signals
contador = signal(0);
this.contador();                              // leer
this.contador.set(10);                        // reemplazar
this.contador.update((previo) => previo + 1); // derivar
```

```html
{{ dato }}
<!-- interpolación -->
{{ señal() }}
<!-- signal: los paréntesis son obligatorios -->
<p [title]="dato"></p>
<!-- propiedad -->
<button (click)="fn()"></button>
<!-- evento -->
<input [(ngModel)]="dato" />
<!-- bidireccional, necesita FormsModule -->
<router-outlet />
<!-- outlet del padre, para las hijas -->
```

---

## Links

- [Hooks de ciclo de vida](https://angular.dev/guide/components/lifecycle)
- [Lazy loading](https://angular.dev/guide/routing/define-routes#lazily-loaded-components)
- [Bindeo de eventos](https://angular.dev/guide/templates/event-listeners)
- [Bindeo bidireccional](https://angular.dev/guide/templates/two-way-binding)
- [Rutas hijas](https://angular.dev/guide/routing/common-router-tasks#nesting-routes)
- [Signals](https://angular.dev/guide/signals)

