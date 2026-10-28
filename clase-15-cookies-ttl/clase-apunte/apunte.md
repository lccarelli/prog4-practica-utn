# Clase 15 — Fullstack, deploy y TTL

**Fecha:** 27/10/2026 · **Paquetes:** `cookie-parser`, `@nestjs/throttler`, `@nestjs/cache-manager`

Video: *"Clase 15 - Fullstack, Deploy, TTL"*, partes 1 y 2. Código del profesor: `clase-15-cookies/` (con `server/` y `client/`) y `clase-15-ttl-lazy-loading/`.

## Qué se dio

- Cerrar el JWT de la clase 14 con un front en Angular: CORS, `HttpClient` e interceptor
- Cookies de punta a punta: `credentials`, CORS con credenciales y `cookie-parser`
- Cookies o `localStorage`
- Deploy: el back no anduvo en Vercel; back y front en **Render**
- Lazy loading de módulos en Nest
- Limitar la frecuencia de peticiones con el **throttler**
- **Caché** con TTL

"TTL" en el título resume el throttler y el caché, porque los dos usan *Time To Live*.

---

## 1. Fullstack: Angular contra el server de la clase 14

Arrancó con el server de JWT. Hubo dos errores en vivo, de lo que había quedado de la clase pasada:
- El token vencía a 1 segundo. Lo pasó a `60 * 15`.
- Una ruta devolvía texto plano: "nunca devolvemos un objeto vacío, siempre un JSON". `HttpClient` espera JSON, así que `/dibujo` pasó a devolver `{ mensaje: ... }`.

El cliente es el componente raíz con tres botones: Registrarse, Login y "Traer algo que requiera token". Usa `HttpClient`:

```typescript
Registrarse() {
  this.http
    .post(`${environment.API_URL}/auth/registro`, { user: 'HOLA' })
    .subscribe((data: any) => localStorage.setItem('token', data.token));
}
```

Lo ideal sería un formulario; lo salteó. Otro error en vivo: el botón Traer no hacía nada porque faltaba el `.subscribe()`.

### CORS

> "Cualquier conexión desde un cliente requiere CORS."

```typescript
app.enableCors({ origin: '*' });   // primero así "para no complicarla"
```

### Interceptor para el header

Para no agregar el `Authorization` a mano en cada petición:

```typescript
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const clon = req.clone({
    headers: req.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token')),
  });
  return next(clon);
};
// app.config.ts
provideHttpClient(withInterceptors([tokenInterceptor])),
```

- Se equivocó con la sintaxis en vivo: pasaba un objeto a `headers` en lugar de `req.headers.set(...)`. "Esta sintaxis es una porquería."
- Sin token manda `Bearer null`; dijo que no afecta al back. Al borrar el `localStorage`, la ruta protegida da 403.

"Es tomar lo que hay en Postman y plasmarlo en el frontend, igual que en Programación 3."

## 2. Cookies de punta a punta

### Repaso

El servidor la crea con el header `Set-Cookie`: nombre, valor y atributos.

| Atributo | Qué hace |
| -------- | -------- |
| `path` | En qué rutas aplica |
| `expires` | Cuándo vence |
| `HttpOnly` | El JavaScript del navegador no la puede leer |
| `Secure` | Sólo viaja por HTTPS |
| `SameSite` | Sólo la usa el mismo sitio que la creó. "Siempre está bueno aplicarlo" |

Se ven en DevTools → *Application* → *Cookies*. Una vez guardada, el navegador la manda sola en cada petición a ese server, **siempre que la petición esté configurada para mandarla**.

### Tres configuraciones, tres errores en vivo

**1. En el cliente: `credentials: 'include'`.** Por defecto, las peticiones no guardan las cookies que reciben ni mandan las guardadas. Va en el interceptor, porque es global:

```typescript
const clon = req.clone({ headers: ..., credentials: 'include' });
```

Primero escribió `true` y se corrigió: en el cliente es `'include'` y en el back es `true`.

**2. En el server: el origin no puede ser `*`.** Con credenciales, el navegador lo rechaza: con cookies se busca la comunicación entre *este* cliente y *este* servidor.

**3. En el server: `credentials: true`**, para que responda `Access-Control-Allow-Credentials: true`.

```typescript
app.enableCors({
  origin: process.env.ORIGIN,     // http://localhost:4200 en local; "debería ir a ambiente"
  credentials: true,
});
```

> "Es un quilombo de configuración, no es un quilombo de lógica ni de concepto."

Con eso, la petición a `/dibujo` lleva `Cookie: token=...`. "No me tengo que encargar a mano de guardarlo en localStorage y traerlo."

### Leerla en el server: `cookie-parser`

`req.cookies` daba `undefined`, igual que al final de la clase 14. Falta el middleware que parsea las cookies, como `express.json` para el body:

```bash
npm i cookie-parser
npm i -D @types/cookie-parser      # es de JavaScript: los tipos van aparte
```

```typescript
// main.ts
app.use(cookieParser());

// token.guard.ts
const token = req.cookies.token || '';
```

### ¿Cookies o localStorage?

"Es una pregunta bastante abierta, depende del caso." Hay otros almacenamientos: `sessionStorage`, que se borra al cerrar el navegador, e IndexedDB. Hay dos razones para no depender sólo de las cookies:
- **Legal**: hay que pedir permiso para usarlas, y si el usuario las rechaza hace falta otro método.
- **Contexto**: las cookies son del navegador. Una app de escritorio no las tiene.

Se puede usar uno, otro o los dos.

## 3. Deploy

> "El TP lo pedimos deployado completamente."

Se puede usar cualquier plataforma; lo que importa es que el link funcione el día que lo prueban. Mientras antes, mejor.

### Sacar lo hardcodeado

- **Server**: `ORIGIN` y la clave al `.env`, y la URI de Mongo también: "la idea es la misma".
- **Cliente**: `ng generate environments` y reemplazar la URL por `` `${environment.API_URL}/...` ``. En `environment.development.ts` va `http://localhost:3000` y en `environment.ts`, la de producción, **sin la barra final**.

### Vercel para el back: no anduvo

1. Le puso Root Directory a la carpeta del server y eligió el preset NestJS.
2. Rechazó la variable `CONTRASEÑA_DEL_SERVER` por la **ñ**: "es mi culpa, no debería haber hecho una variable con ñ". La renombró a `CONTRASENA_DEL_SERVER`.
3. El build corre `nest build` y el server llega a levantar, pero Vercel se queda colgado en *building* y después da 500.
4. Probó con otros presets, cambió el directorio de salida y un `vercel.json`, sin resultado. Su hipótesis: Vercel espera algo de versiones viejas de Nest; el ejemplo del cuatrimestre pasado sí anda.

Dejó la pregunta abierta y lo resolvió con Render. Para el front, Vercel sigue siendo lo más fácil.

### Render: el back como Web Service

| Campo | Valor |
| ----- | ----- |
| Root Directory | La carpeta del server |
| Build Command | `npm install && npm run build` |
| Start Command | `npm run start:prod` (→ `node dist/main`) |
| Plan | Gratis |
| Environment | Las mismas variables del `.env` |

"Lo de Render no es más que acordarse el build command y el start command." En todo proyecto de Node, `install` instala, `build` compila y `start` arranca.

**Desventaja del plan gratis:** si no se usa, el servicio se apaga y tarda uno o dos minutos en volver.

### Render: el front como Static Site

| Campo | Valor |
| ----- | ----- |
| Root Directory | La carpeta del cliente |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist/<proyecto>/browser` |
| Start Command | Ninguno: son archivos estáticos |

Después, en el server, se cambia `ORIGIN` por la URL del front y se redeploya. Mientras no se redeploya, da error de CORS. Render, como Vercel, redeploya solo al pushear.

### Error en producción: SameSite

En local andaba. En internet, la cookie se guardaba pero **no se mandaba**. El navegador avisaba que la cookie no tenía `SameSite`, que había tomado `Lax` y que eso la bloquea entre sitios. Cliente y server están en dominios distintos: no es el mismo sitio.

```typescript
response.cookie('token', token, {
  httpOnly: true,
  sameSite: 'none',     // front y back en dominios distintos
  secure: true,         // SameSite=None lo exige
  expires: new Date(Date.now() + 1000 * 60 * 15),
});
```

La cookie del registro no tenía `secure` y el navegador la rechazó; la del login sí lo tenía y anduvo. Para el profe, aflojar `sameSite` no resigna seguridad: la seguridad viene de CORS con credenciales y un origin concreto.

> "Todo lo arreglé leyendo los errores, no memoricé nada."

## 4. Lazy loading en Nest

Es una característica distinta de la de Angular, aunque comparte nombre e idea.

- En Angular, el problema era que **al cliente** le llegaba todo junto.
- En Nest no se le manda nada al cliente. Al arrancar, el server instancia **todos** los módulos una sola vez. Sólo cuesta tiempo de arranque; después la ejecución es igual.

La carga diferida hace que un módulo se cargue recién cuando se necesita:

```typescript
constructor(private lazyModuleLoader: LazyModuleLoader) {}

async findAll() {
  const { ProductoModule } = await import('../producto/producto.module.js');
  const moduloCargado = await this.lazyModuleLoader.load(() => ProductoModule);
  const { ProductoService } = await import('../producto/producto.service.js');
  moduloCargado.get(ProductoService).algo();
}
```

- El módulo lazy **no se importa en ningún lado** y **no puede tener controllers**, porque las rutas se registran al arrancar. Servicios sí.
- Hay `load` y no hay `unload`: lo que se carga queda.
- En vivo copió primero la versión de la doc que usa `app.get(LazyModuleLoader)` en el `main`; "ese no iba".
- **Cuándo usarlo**:
  - Cron jobs: una tarea de las 8 hs no necesita cargarse al arrancar.
  - Webhooks que casi no llegan.
  - Servers grandes que tardan en levantar.

  **No** sirve para cargar en cada petición.

> "¿De qué nos sirve esto para el TP? No mucho." Si no tiene un lugar lógico, no hace falta ponerlo.

## 5. Throttler: limitar la frecuencia

Limita cuántas peticiones puede hacer un mismo cliente **por IP** en un período. Sirve contra el que hace un `for` con miles de `fetch`, cada uno con su consulta a la base. "No podemos evitar que alguien nos haga un fetch, pero sí que no sea mi culpa ejecutar cosas de más."

```bash
npm i @nestjs/throttler
```

```typescript
// app.module.ts
imports: [
  ThrottlerModule.forRoot([
    { name: 'short',  ttl: 1000,  limit: 3 },     // 3 por segundo
    { name: 'medium', ttl: 10000, limit: 20 },
    { name: 'long',   ttl: 60000, limit: 100 },
  ]),
],
providers: [
  { provide: APP_GUARD, useClass: ThrottlerGuard },   // = @UseGuards(ThrottlerGuard) en todo
],
```

- `ttl` es *Time To Live* (en clase dijo "time to leave"), en milisegundos, y `limit` es el máximo de peticiones en ese tiempo.
- **Error en vivo:** con sólo el `ThrottlerModule` no limitaba nada. Faltaba registrar el **guard**. "Lo estás detectando pero no estás haciendo nada", resumió un alumno.
- Al pasarse, responde **429 Too Many Requests**. La ventana se mueve: cuando pasa el `ttl` desde la primera petición, "ya nos olvidamos que existió".
- Por ruta se puede saltear o cambiar el límite. Lo nombró, no lo mostró.

## 6. Caché

Si la respuesta es siempre la misma, se guarda y se devuelve sin volver a la base, que "es lo que más gasta". Es "como `localStorage` para el backend": `get` y `set` con clave y valor. Puede estar en memoria, en disco o en Redis.

```bash
npm i @nestjs/cache-manager cache-manager
```

```typescript
// usuario.module.ts
imports: [CacheModule.register({ ttl: 5000 })],

// usuario.service.ts
import type { Cache } from 'cache-manager';
constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

async findAll() {
  const guardados = await this.cacheManager.get('usuarios');
  if (guardados) return guardados;

  const usuarios = [{ nombre: 'agus' }, { nombre: 'Nat' }, { nombre: 'Daniel' }];
  this.cacheManager.set('usuarios', usuarios);
  return usuarios;
}
```

- **Errores en vivo:**
  - `set` no aparecía porque hay otro `Cache` que choca. Se arregla con `import type { Cache } from 'cache-manager'`.
  - `Nest can't resolve dependencies … CACHE_MANAGER`: el `CacheModule` va en el módulo **donde se usa**.
- Con TTL de 5 s, la primera petición tarda más, las siguientes casi nada, y a los 5 s vuelve a tardar.
- Hay un `CacheInterceptor` que cachea respuestas con decoradores. Lo nombró, no lo mostró.
- **Por tiempo o por evento.** Contó el ejemplo de su trabajo: el menú de un restaurante se cachea sin vencimiento y se borra cuando el local lo cambia.

---

## Cosas que confunden

| Síntoma | Causa |
| ------- | ----- |
| `HttpClient` falla con una respuesta de texto | El server devuelve texto plano; siempre JSON |
| Error de CORS al llamar al server | Falta `enableCors`, o `ORIGIN` todavía apunta a localhost |
| *Allow-Origin no puede ser `*`* | Con credenciales hay que poner el origin concreto |
| *Allow-Credentials debe ser true* | Falta `credentials: true` en `enableCors` |
| La cookie no se guarda o no se manda | Falta `credentials: 'include'` en el cliente |
| `req.cookies` es `undefined` | Falta `app.use(cookieParser())` |
| En producción la cookie se guarda y no viaja | Falta `sameSite: 'none'` |
| La cookie con `SameSite=None` se rechaza | Le falta `secure: true` |
| Vercel rechaza la variable | Tiene ñ |
| El primer request a Render tarda un minuto | El plan gratis apaga el servicio si no se usa |
| El throttler no limita | Falta el `ThrottlerGuard` como `APP_GUARD` |
| `set` no existe en el cache manager | Importar `type { Cache }` de `cache-manager` |
| `can't resolve … CACHE_MANAGER` | `CacheModule` no está en el módulo que lo usa |

## Referencia rápida

```typescript
// server
app.use(cookieParser());
app.enableCors({ origin: process.env.ORIGIN, credentials: true });
response.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true, expires });
const token = req.cookies.token;

// cliente (interceptor)
req.clone({ credentials: 'include' });
```

## Para el TP 2

- **Deploy completo, obligatorio.** El 29/10 se puede probar con el TP. **Desde el martes 3/11 empiezan a pedir los links.**
- Front en Vercel o Render; back en **Render** (Web Service).
- Variables de entorno sin ñ, y `ORIGIN` con la URL real del front.
- **Throttler y caché**: "Esto sí está buenísimo para aplicarlo." Por ejemplo, cachear un segundo el listado de publicaciones, que diez usuarios que entran juntos ven igual. Hay que invalidarlo cuando alguien publica.
- **Lazy loading**: "más informativo que utilizable". Sólo si tiene un lugar lógico.
- Lo extra suma: se evalúa la consigna, pero lo que se agregue "sirve para la vida".
- Recuperatorio del TP 1: martes 1/12 o jueves 3/12.

## Links

- [MDN — Cookies](https://developer.mozilla.org/es/docs/Web/HTTP/Cookies)
- [MDN — SameSite](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#samesitesamesite-value)
- [Nest — Cookies](https://docs.nestjs.com/techniques/cookies)
- [Nest — CORS](https://docs.nestjs.com/security/cors)
- [Nest — Lazy loading modules](https://docs.nestjs.com/fundamentals/lazy-loading-modules)
- [Nest — Rate limiting](https://docs.nestjs.com/security/rate-limiting)
- [Nest — Caching](https://docs.nestjs.com/techniques/caching)
- [Render — Deploy a Node app](https://render.com/docs/deploy-node-express-app)
