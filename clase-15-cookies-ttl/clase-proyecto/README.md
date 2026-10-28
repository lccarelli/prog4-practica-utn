# Clase 15 — Fullstack, deploy y TTL · proyectos

El apunte de la clase está en [`../clase-apunte/apunte.md`](../clase-apunte/apunte.md).

Tres proyectos, como en la cátedra:

| Carpeta | Qué es | Hecho con |
| ------- | ------ | --------- |
| `server/` | El JWT de la clase 14 con cookies, `cookie-parser` y CORS con credenciales | `nest new`, `nest g resource dibujo`, `nest g module\|controller\|service auth`, `nest g guard auth/token` |
| `client/` | Angular con tres botones contra el server | `ng new`, `ng g environments`, `ng g interceptor interceptors/token` |
| `ttl/` | Throttler, caché y lazy loading | `nest new`, `nest g resource usuario\|mueble`, `nest g module\|service producto` |

## Correrlo en local

```bash
cd server
nvm use && npm ci
cp .env.example .env      # CONTRASENA_DEL_SERVER y ORIGIN=http://localhost:4200
npm run start:dev         # http://localhost:3000
npm test && npm run test:e2e

cd ../client              # en otra terminal
npm ci && npm start       # http://localhost:4200
npm test

cd ../ttl
npm ci && npm run start:dev
npm test && npm run test:e2e
```

En el cliente: **Registrarse** → **Traer algo que requiera token** responde el mensaje. Con **Borrar token** sigue andando, porque viaja la cookie. En DevTools → *Application* → *Cookies* se ve la cookie `token` con `HttpOnly` y `Secure`.

## Deploy en Render

Lo que funcionó en clase. Vercel no levantó el server de Nest 12: quedó colgado en *building*.

**Server — New → Web Service**

| Campo | Valor |
| ----- | ----- |
| Root Directory | `clase-15-cookies-ttl/clase-proyecto/server` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm run start:prod` (`node dist/main`) |
| Environment | `CONTRASENA_DEL_SERVER` y `ORIGIN` = la URL del cliente, sin barra final |

**Cliente — New → Static Site**

| Campo | Valor |
| ----- | ----- |
| Root Directory | `clase-15-cookies-ttl/clase-proyecto/client` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist/client/browser` |

Después:
1. Poner la URL del server en `client/src/environments/environment.ts`.
2. Cambiar `ORIGIN` en el server por la URL del cliente.
3. Redeployar los dos.

En el plan gratis el server se duerme si no se usa y tarda uno o dos minutos en despertar.

## Estructura y qué mirar

```
server/src/
├── main.ts                     cookieParser(), enableCors({ origin, credentials: true })
├── auth/auth.controller.ts     la cookie: httpOnly, sameSite 'none', secure, expires
└── auth/token/token.guard.ts   lee req.cookies.token; si no hay, el Bearer
client/src/app/
├── interceptors/token-interceptor.ts   credentials: 'include' y el Bearer si hay token
└── app.ts                              registro, login y la ruta protegida
ttl/src/
├── app.module.ts               ThrottlerModule.forRoot + APP_GUARD
├── usuario/usuario.service.ts  caché con get/set, TTL de 5 s, del() al modificar
└── mueble/mueble.service.ts    carga ProductoModule con LazyModuleLoader
```

- **Las tres piezas de las cookies entre dominios**:
  - en el cliente, `credentials: 'include'`;
  - en el server, `credentials: true` con un `origin` concreto (con credenciales no se puede usar `*`);
  - en la cookie, `sameSite: 'none'` con `secure: true`.

  Si falta una, la cookie no se guarda o no se manda. El error aparece en la consola o en la pestaña *Network*.
- **`token.guard.ts`**: usa `req.cookies?.token`. Sin `cookie-parser`, `req.cookies` es `undefined`; el test unitario lo cubre.
- **`app.module.ts` de `ttl`**: sin el `APP_GUARD`, el throttler no bloquea nada. Fue el error en vivo.
- **`usuario.module.ts`**: el `CacheModule` se registra en el módulo que lo usa. El otro error en vivo fue `Nest can't resolve dependencies … CACHE_MANAGER`.
- **El e2e de `ttl`**: prueba que `ProductoService` no existe hasta el primer `GET /mueble`.

## Diferencias con el código de la cátedra

| Acá | En la cátedra | Por qué |
| --- | ------------- | ------- |
| Cookie del registro igual a la del login (`secure: true`) | Registro con `sameSite: 'none'` sin `secure` | El navegador la rechaza: lo mostró en vivo, pero no lo corrigió |
| `@Res({ passthrough: true })` en las dos rutas | El registro con `response.send()` | Una sola forma |
| `UnauthorizedException` (401) | `return false` / `ForbiddenException` (403) | La consigna del TP 2 pide 401 |
| Clave leída en cada llamada | Constante arriba del archivo | Se evalúa antes de que cargue el `.env` (ver el apunte de la 14) |
| `ORIGIN` con `localhost:4200` por defecto | Sin valor por defecto | Para que ande sin `.env` en local |
| El interceptor no manda `Bearer null` | `'Bearer ' + localStorage.getItem('token')` | Sin token no hace falta el header |
| La respuesta se ve en pantalla | `console.log` | — |
| Sin `environment.vercel.ts` | Apunta a localhost | Quedó del intento con Vercel |
| `await cacheManager.set(...)` | Sin `await` | Es una promesa; el lint lo marca |
| `CacheModule` sólo en `UsuarioModule` | También en `AppModule` | El de `AppModule` no se usaba |
| Lazy loading en `mueble` y caché en `usuario` | Los dos en `usuario.findAll` | Un tema por ruta |
| `cacheManager.del()` en `update` | Sólo lo contó (invalidar por evento) | Mostrar las dos formas: por tiempo y por evento |
