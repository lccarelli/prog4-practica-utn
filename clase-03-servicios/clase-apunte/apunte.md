# Clase 03 — Input, output, servicios y HTTP

**Fecha:** 25/08/2026 · **Angular:** 22.1.0

## Qué se dio

- `input()` — datos del padre al hijo
- `output()` — eventos del hijo al padre
- Servicios e inyección de dependencias
- `HttpClient` y peticiones a APIs externas

---

## 1. `input()` — del padre al hijo

En el hijo se declara qué espera recibir:

```typescript
export class Listar {
  productosInput = input<IProducto[]>([]);
}
```

El valor entre paréntesis es el **default**, el que vale mientras el padre no
mande nada. Sin default, el input arranca en `undefined` y el template puede
explotar en el primer render.

En el padre se pasa como un bindeo de propiedad, usando el nombre de la
propiedad del hijo:

```html
<app-listar [productosInput]="array"></app-listar>
```

En el template del hijo **se lee con paréntesis**, porque `input()` devuelve un
signal de sólo lectura:

```html
@for (item of productosInput(); track $index) {
  <p>{{ item.nombre }} - {{ item.precio }}</p>
}
```

Para que sea obligatorio: `input.required<IProducto[]>()`, sin default. Si el
padre se olvida de pasarlo, falla en compilación en vez de en runtime.

## 2. `output()` — del hijo al padre

En el hijo se declara el evento y se emite:

```typescript
export class Crear {
  eventoCrearProducto = output<IProducto>();

  crear() {
    const productoNuevo: IProducto = { nombre: this.nombre, precio: this.precio };
    this.eventoCrearProducto.emit(productoNuevo);
  }
}
```

En el padre se escucha con la sintaxis de evento, y el valor emitido llega como
`$event`:

```html
<app-crear (eventoCrearProducto)="recibirProductoCreado($event)"></app-crear>
```

El nombre del evento es el de la propiedad del hijo. No hay convención
obligatoria, pero conviene que el nombre diga qué pasó, no qué hacer.

### La regla que ordena todo

**Los datos bajan por `input`, los eventos suben por `output`.** El hijo nunca
modifica lo que recibe: avisa, y el padre decide qué hacer. Por eso `input()`
devuelve un signal de sólo lectura.

## 3. La trampa del `push`

En el padre, al recibir el evento:

```typescript
recibirProductoCreado(productoCreado: IProducto) {
  // this.array.push(productoCreado);   ← no dispara el cambio
  this.array = [...this.array, productoCreado];
}
```

`push` muta el array pero **deja la misma referencia**, y Angular compara
referencias. Al hijo le llega el mismo array de siempre y no vuelve a
renderizar. Hay que crear uno nuevo con el spread.

Es la misma idea que vimos en la clase 02 con los signals: lo que dispara el
cambio es la asignación, no la mutación.

## 4. Servicios

Un servicio es una clase con lógica reutilizable — típicamente el acceso a
datos — que Angular sabe crear e inyectar.

```typescript
import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Service()
export class Github {
  http = inject(HttpClient);
  apiUrl = 'https://api.github.com/users/pepe';

  traerUsuarioGithub() {
    return this.http.get<UsuarioGithub>(this.apiUrl);
  }
}
```

**En Angular 22 el decorador es `@Service()`; hasta la 21 es
`@Injectable({ providedIn: 'root' })`.** Los dos hacen lo mismo: registrar la
clase para que se pueda inyectar, con una única instancia compartida por toda
la aplicación.

### Inyectar

```typescript
export class Perfil {
  github = inject(Github);
}
```

La forma vieja es por constructor: `constructor(private github: Github) {}`. El
profe dejó anotado que `inject()` funciona con los dos decoradores, pero la
inyección por constructor sólo con `@Injectable`.

### Qué va adentro y qué no

**El servicio no se suscribe.** Devuelve el observable y el componente decide
cuándo escucharlo. Si el servicio se suscribe, no puede devolver nada útil y el
componente pierde el control del ciclo de vida.

## 5. HttpClient

### Habilitarlo

```typescript
// app.config.ts
import { provideHttpClient } from '@angular/common/http';

providers: [provideHttpClient(), provideBrowserGlobalErrorListeners(), provideRouter(routes)];
```

Sin esta línea, inyectar `HttpClient` tira
`NullInjectorError: No provider for HttpClient`. Es el error más común de la
clase.

### La petición

```typescript
this.http.get<Respuesta>(this.apiUrl, {
  params: { name: nombre },
});
```

El genérico `<Respuesta>` **no valida nada en runtime**: es una promesa que le
hacés a TypeScript sobre lo que va a llegar. Si la API devuelve otra cosa, el
error aparece más tarde y en otro lado.

`params` arma el query string y se encarga de codificar espacios y caracteres
raros. La alternativa es concatenar a mano, que rompe con el primer espacio.

### Los observables son fríos

```typescript
this.github.traerUsuarioGithub(); // no hace absolutamente nada
```

**Sin `.subscribe()` la petición nunca se dispara.** No hay error, no aparece
nada en la pestaña Network. Es desconcertante la primera vez: parece que el
código no se ejecutó.

```typescript
this.github.traerUsuarioGithub().subscribe({
  next: (respuesta) => this.usuario.set(respuesta),
  error: (err) => console.error(err),
});
```

La forma de objeto con `next` y `error` es mejor que pasar una sola función:
obliga a decidir qué pasa cuando falla.

### Desuscribirse

```typescript
export class Perfil {
  suscripcion?: Subscription;

  ngOnInit() {
    this.suscripcion = this.github.traerUsuarioGithub().subscribe({ ... });
  }

  ngOnDestroy() {
    this.suscripcion?.unsubscribe();
  }
}
```

Es la misma historia del `clearInterval` de la clase 02: si el componente se
destruye con la petición en vuelo, el callback sigue apuntando a un componente
que ya no existe.

Para `HttpClient` el riesgo es acotado, porque completa sola después de una
respuesta. Se vuelve importante con observables que no terminan nunca, como los
de un buscador o un websocket. Guardar la suscripción y cortarla es el hábito
correcto.

## 6. Estado del componente con signals

```typescript
usuario = signal<UsuarioGithub | null>(null);
mensaje = signal<string | null>(null);
```

El `| null` es el estado "todavía no llegó". En el template:

```html
@if (usuario(); as u) {
  <h2>{{ u.login }}</h2>
  <img [src]="u.avatar_url" />
}
```

El `as u` guarda el valor en una variable local, así no hace falta invocar el
signal en cada línea y TypeScript ya sabe que no es `null` adentro del bloque.

Un signal aparte para el mensaje de error deja mostrar "no se encontró" o
"error de conexión" sin ensuciar el de los datos.

## 7. Dónde poner las interfaces

El profe las definió **adentro del archivo del servicio**:

```typescript
// services/github.ts
export interface UsuarioGithub {
  login: string;
  avatar_url: string;
  bio: string;
}

@Service()
export class Github { ... }
```

La alternativa es una carpeta `interfaces/` aparte, que es lo que hizo en el
ejemplo de input/output. Las dos son válidas: adentro del servicio si el tipo
sólo lo usa ese servicio, en carpeta propia si lo comparten varios.

---

## Cosas que confunden

| Síntoma | Causa |
| ------- | ----- |
| `NullInjectorError: No provider for HttpClient` | Falta `provideHttpClient()` en `app.config.ts` |
| No aparece ningún pedido en Network | Falta el `.subscribe()`: el observable es frío |
| El input llega `undefined` en el primer render | `input()` sin valor por defecto |
| Agrego al array y la lista no se actualiza | Se usó `push`; hay que asignar un array nuevo |
| El template dice que el input no es una función | Falta invocarlo: va `miInput()`, no `miInput` |
| El padre no se entera del evento | El nombre del `output()` y el del `( )` no coinciden |
| Los datos llegan pero el tipo está mal | El genérico del `get<T>` no valida en runtime |
| El query string sale roto con espacios | Se concatenó a mano en vez de usar `params` |

## Referencia rápida

```typescript
// Hijo
dato = input<Tipo>(valorPorDefecto);      // recibe
obligatorio = input.required<Tipo>();     // recibe, sin default
aviso = output<Tipo>();                   // emite
this.aviso.emit(valor);

// Servicio
@Service()                                 // Angular 22
@Injectable({ providedIn: 'root' })        // hasta la 21
export class MiServicio {
  http = inject(HttpClient);
  traer() {
    return this.http.get<T>(url, { params: { clave: valor } });
  }
}

// Componente
servicio = inject(MiServicio);
suscripcion?: Subscription;
ngOnInit() {
  this.suscripcion = this.servicio.traer().subscribe({ next: ..., error: ... });
}
ngOnDestroy() { this.suscripcion?.unsubscribe(); }
```

```html
<app-hijo [dato]="valor" (aviso)="manejar($event)"></app-hijo>

@if (senal(); as v) { {{ v.campo }} }
@for (x of lista(); track x.id) { {{ x.nombre }} }
```

## Links

- [Input](https://angular.dev/guide/components/inputs)
- [Output](https://angular.dev/guide/components/outputs)
- [Inyección de dependencias](https://angular.dev/guide/di/dependency-injection)
- [Creación de servicios](https://angular.dev/guide/di/creating-injectable-service)
- [HttpClient](https://angular.dev/guide/http)
- [Configurar HttpClient](https://angular.dev/guide/http/setup)
- [Peticiones](https://angular.dev/guide/http/making-requests)
