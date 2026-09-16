# Clase 09 — PWA, Service Worker e Interceptors

**Fecha:** 15/09/2026 (video subido 17/09/2026) · **Angular:** 22.1.0

Video: *"Clase 09 - Charla TP, PWA e Interceptors"*, partes 1 y 2. Ojo con el
índice de la lista de reproducción del canal: el profesor subió de vuelta un
video de otra materia (Programación III) en el medio, así que el orden por
número de la playlist no coincide con el orden real de las partes.

## Qué se dio

- Devolución general de cómo venían los TPs a esa altura (parte no técnica)
- Progressive Web App: qué es, en qué se diferencia de Ionic
- Service Worker: caché programable, `ng add @angular/pwa`, los dos archivos
  de configuración (`manifest.webmanifest` y `ngsw-config.json`)
- Interceptors de `HttpClient`: agregar algo a todas las peticiones sin
  repetir código, y modificar la respuesta antes de que llegue al `subscribe`

El ejemplo en vivo de interceptors fue la **API de la NASA** (la de la foto
astronómica del día), agregando la `api_key` a todas las peticiones y
reemplazando la respuesta por una imagen de error cuando el resultado
devuelve un video en vez de una imagen.

---

## 0. Devolución sobre los TPs (no técnico, pero cuenta para la entrega)

Cosas puntuales que señaló sobre los repos que ya estaban viendo:

- Tiene que haber una pantalla donde el usuario **elija cómo comprar**
  (registrado o anónimo) antes de llegar al pago — no saltearse esa decisión.
- La consigna llega en varios correos a lo largo de la cursada. **El TP no
  se arma en el orden de los correos**, se arma con el resultado final: si
  el último correo contradice a uno anterior, gana el último. El primer
  entregable (bajar los requerimientos a un documento escrito) es
  justamente para vos ordenar eso.
- La UI **no puede calcar los colores/estilo de un cine real** (Cinemark,
  Cinépolis, etc.) — estilo propio o inspirado en otra cosa, no en la
  competencia.
- Revisar bien cómo pide la consigna el **orden de los asientos** en la
  sala — varios correos hablan de esto puntualmente.
- Todos los campos que pide el registro van, aunque parezcan un chiste
  (sí, color de ojos también). No es un chiste.
- El favicon y el título de la pestaña **tienen que estar cambiados** — no
  puede quedar el logo/título default de Angular en la entrega final.
- Recordatorio de proceso: hacer commits seguido aunque el TP esté
  incompleto o roto ("aunque esté feo, aunque no ande, súbanlo"), y avisar
  si el deploy no salió por algún motivo.

## 1. PWA — qué es y en qué se diferencia de Ionic

Una Progressive Web App busca que una aplicación web tenga capacidades que
antes eran exclusivas de una app nativa (instalable, funciona sin conexión,
se siente como una app), **sin generar builds separadas por plataforma**.

La comparación que hizo con Ionic: Ionic parte de un mismo código pero
**compila un ejecutable distinto para cada plataforma** (`ionic build` para
web, para iOS, para Android). La idea de una PWA es la opuesta — el
**mismo build web** se ejecuta en todos lados, y es el navegador/sistema
operativo el que le da capacidades de app nativa a esa página (instalarla,
darle un ícono propio, abrirla sin la barra de direcciones, etc.), sin
traducir nada a código nativo.

Como Angular genera aplicaciones **SPA** (un solo `index.html`, todo el
cambio de contenido lo hace JavaScript sin recargar la página), encaja bien
con esto: ya se controla qué se carga y cuándo desde el propio framework.

## 2. Por qué "sin internet" importa (el caso de uso real)

La idea no es "instalás la app y nunca más te conectás". Es que **en
tramos cortos sin conexión la app siga andando** con lo último que ya tenía
cargado, y se actualice sola apenas vuelve la conexión. Eso se logra
guardando en caché los archivos que no cambian seguido (el HTML base, el
JS, el CSS, los íconos) y sólo yendo a buscar al servidor lo que sí cambia.

## 3. Service Worker

Un Service Worker es un archivo de configuración que actúa como un
**proxy de red**: se para entre la app y el servidor, y decide para cada
petición (incluidas las que salen de un `<img src>`, no sólo `fetch`) si
la responde con lo que ya tiene guardado en caché o si va a buscarla.

Qué garantiza (tal como lo remarca la documentación):

- **Nunca mezcla versiones**: si cambiaron el HTML y las imágenes juntos,
  no puede llegar HTML nuevo con imágenes viejas o viceversa.
- Una pestaña ya abierta sigue con la versión con la que cargó hasta que
  se recarga; una pestaña nueva carga la versión más reciente ya cacheada.
- Sólo descarga de nuevo lo que efectivamente cambió.

Se puede inspeccionar en Chrome DevTools → **Application → Service
Workers** (ver si hay uno activo, su archivo fuente) y en
`chrome://serviceworker-internals`-equivalente del navegador se listan
**todos** los service workers instalados en la máquina, de todas las
páginas visitadas alguna vez.

**Ojo con esto en desarrollo:** dejar tildado "Offline" en la pestaña
Network de DevTools para probar el modo sin conexión y olvidarse de
destildarlo rompe el desarrollo normal (parece que no hay internet) sin
ningún otro síntoma.

## 4. Instalación con Angular

```bash
ng add @angular/pwa
```

**No funciona en `localhost`** — el Service Worker de Angular está
deshabilitado en desarrollo a propósito. Para probarlo hay que levantar un
build de producción:

```bash
ng build --configuration production
ng serve --configuration production   # o servir dist/<proyecto>/browser con un http-server
```

o directamente probarlo ya deployado.

Archivos que genera/modifica:

- `ngsw-config.json` (raíz del proyecto) — la configuración del caché.
- `public/manifest.webmanifest` — identidad de la app (nombre, colores,
  íconos, `display`).
- `public/icons/` — íconos en varios tamaños (hay que reemplazarlos por
  los de la propia app, igual que el favicon).
- `index.html` — agrega el `<link rel="manifest">`.
- `app.config.ts` — agrega `provideServiceWorker`:

```typescript
provideServiceWorker('ngsw-worker.js', {
  enabled: !isDevMode(),
  registrationStrategy: 'registerWhenStable:30000',
})
```

## 5. `ngsw-config.json` — qué cachear y cómo

```json
{
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": ["/favicon.ico", "/index.html", "/manifest.webmanifest", "/*.css", "/*.js"]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": ["/assets/**", "/*.(svg|cur|jpg|jpeg|png|apng|webp|avif|gif|otf|ttf|woff|woff2)"]
      }
    }
  ]
}
```

Dos modos de instalación:

- **`prefetch`**: se descarga todo apenas entra el Service Worker, para
  que la próxima visita sea instantánea. Bien para lo que es chico
  (bundle de JS/CSS, el `index.html`). Mal si se abusa con archivos
  pesados o muchos — la primera carga se vuelve lenta.
- **`lazy`**: se cachea recién la primera vez que se pide ese recurso (por
  ejemplo, una imagen puntual). Ideal para assets que no hace falta tener
  todos de entrada.

La decisión de qué grupo usar para cada tipo de archivo es de diseño: **qué
cambia seguido y qué no** en tu app en particular (un diario cachea la
estructura/HTML pero no las imágenes ni las noticias, porque esas cambian
todo el tiempo).

## 6. Deploy con el proyecto en una subcarpeta del repo

Si el proyecto de Angular no está en la raíz del repositorio (como en el
ejemplo de esta clase: carpeta `clase-09-pwa`), hay que indicarle al
servicio de deploy (Vercel, Render, etc.) el **output directory** exacto:

```
dist/<nombre-proyecto>/browser
```

Si se deja el default, el build "corre" pero no encuentra los archivos
correctos y las actualizaciones no se reflejan — mismo síntoma que ya
había aparecido con Render en la clase 08.

---

## 7. Interceptors — el concepto

Un interceptor de `HttpClient` es el equivalente, del lado del cliente, a
un **middleware de backend**: una función que se para en el medio de cada
petición saliente (o cada respuesta entrante) y puede modificarla antes de
que siga su curso. Se pueden encadenar varios — cada uno procesa antes de
pasarle el resultado al siguiente.

Casos de uso típicos (según la documentación de Angular, todos mencionados
en clase): agregar siempre el mismo header de autenticación o la misma API
key, reintentar peticiones fallidas, cachear respuestas, medir tiempos y
loguearlos, prender/apagar un indicador de carga global, parsear
respuestas de forma personalizada.

## 8. Por qué la API key va en `environment` aunque "no sea secreta"

Aclaración importante que surgió por una pregunta: guardar algo en
variable de entorno **no es siempre por seguridad**. Es también para poder
reemplazar fácilmente ese valor entre desarrollo y producción sin tocar
código. Ejemplo que dio (Mercado Pago): el ID público del comercio no es
secreto — se ve en cualquier botón de pago —, pero conviene tenerlo en
`environment` para que en desarrollo apunte a la cuenta de pruebas y en
producción a la cuenta real, sin cambiar una línea de código a mano en
cada lado.

Mismo motivo por el que las keys públicas de Supabase (`anon key`, URL del
proyecto) no están pensadas para quedar ocultas: la seguridad de Supabase
vive en las políticas de RLS del lado del servidor, no en esconder esa
key. **Un secreto siempre tiene que ser variable de entorno, pero una
variable de entorno no siempre es un secreto.**

## 9. Crear y registrar un interceptor

```bash
ng generate interceptor interceptors/api --skip-tests
```

Genera una función con la misma firma que documenta Angular:

```typescript
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
```

Se registra en `app.config.ts`, dentro de `provideHttpClient`:

```typescript
provideHttpClient(withInterceptors([apiInterceptor]))
```

## 10. Modificar la petición (`req`) — hay que clonarla

El objeto `req` que llega por parámetro **no es modificable directamente**
(no es un objeto plano editable). Para cambiarlo hay que clonarlo con
`.clone()` pasándole sólo lo que cambia:

```typescript
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const reqConApiKey = req.clone({
    params: req.params.set('api_key', API_KEY),
  });

  return next(reqConApiKey);
};
```

Ojo con el método: para **query params** es `.set()` (o `.append()` para
agregar sin reemplazar); `.append()` a secas sobre `params` en la sintaxis
de headers no hace nada — es fácil confundir el método de params con el de
headers y que no tire ningún error, simplemente no se agregue el valor.

## 11. Modificar la respuesta — `pipe`, `tap` y `map` sobre el observable

La respuesta que devuelve `next(req)` es un `Observable<HttpEvent<...>>`,
no se puede simplemente "abrir, editar y devolver" como con la request. Se
usa `.pipe()` (mismo concepto que los pipes de plantillas, aplicado acá a
un observable) con operadores de RxJS:

- **`tap`**: para efectos secundarios que no cambian el valor emitido —
  por ejemplo, marcar un signal de "cargando" en un servicio.
- **`map`**: para transformar el valor emitido — por ejemplo, reemplazar
  el body de la respuesta.

Importante: por `req` puede pasar más de un tipo de evento (no sólo la
respuesta final), así que antes de tocar `event.body` hay que chequear que
sea efectivamente una respuesta:

```typescript
import { HttpEventType } from '@angular/common/http';
import { map, tap } from 'rxjs';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  loadingService.cargando.set(true);

  const reqConApiKey = req.clone({
    params: req.params.set('api_key', API_KEY),
  });

  return next(reqConApiKey).pipe(
    tap((event) => {
      if (event.type === HttpEventType.Response) {
        loadingService.cargando.set(false);
      }
    }),
    map((event) => {
      if (event.type === HttpEventType.Response && event.body?.media_type === 'video') {
        return event.clone({ body: { ...event.body, url: 'assets/error.png' } });
      }
      return event;
    }),
  );
};
```

El indicador de carga necesita un **servicio** (`LoadingService` con un
signal) porque el interceptor no tiene forma de tocar directamente una
variable local de un componente — no hay `@Input`/`@Output` posible ahí,
un servicio inyectado es la única conexión.

## 12. Limitar un interceptor a ciertas URLs

Si no se quiere que el interceptor actúe de forma global, se filtra por
`req.url` adentro de la propia función:

```typescript
if (req.url === API_URL) {
  // lógica del interceptor
}
return next(req);
```

---

## Cosas que confunden

| Síntoma | Causa |
| ------- | ----- |
| El Service Worker "no anda" en desarrollo | Está deshabilitado a propósito en `localhost`; hay que probarlo con un build de producción o ya deployado |
| El deploy no refleja cambios / no carga nada | El proyecto está en una subcarpeta del repo y el output directory sigue apuntando a `dist` en vez de `dist/<proyecto>/browser` |
| El dev normal se rompe sin motivo aparente (como si no hubiera internet) | Quedó tildado "Offline" en la pestaña Network de DevTools de una prueba anterior |
| El interceptor no modifica nada y no tira error | `req` no se puede mutar directo — hay que usar `.clone()` y devolver ese clon a `next()` |
| Se agregó un param pero no llega en la petición | Se usó la sintaxis de `headers` en vez de `.set()`/`.append()` sobre `params` |
| El interceptor de respuesta rompe o no filtra bien | Falta chequear `event.type === HttpEventType.Response` antes de leer `event.body` — otros tipos de evento pasan por el mismo `pipe` |

## Referencia rápida

```typescript
export const miInterceptor: HttpInterceptorFn = (req, next) => {
  const reqModificada = req.clone({ params: req.params.set('clave', 'valor') });

  return next(reqModificada).pipe(
    map((event) => {
      if (event.type === HttpEventType.Response) {
        // modificar event.body acá
      }
      return event;
    }),
  );
};
```

```typescript
provideHttpClient(withInterceptors([miInterceptor]))
```

```bash
ng generate interceptor interceptors/nombre --skip-tests
ng add @angular/pwa
ng build --configuration production
```

## Links

- [Interceptors](https://angular.dev/guide/http/interceptors)
- [Service Worker en Angular](https://angular.dev/ecosystem/service-workers)
- [Web app manifest](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest)
