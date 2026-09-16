# Clase 09 — PWA, Service Worker e interceptors · proyecto

El apunte de la clase está en [`../clase-apunte/apunte.md`](../clase-apunte/apunte.md).

```bash
nvm use
npm ci
npm start        # http://localhost:4200 — el interceptor anda; el Service Worker no
```

El Service Worker está apagado en desarrollo. Para verlo hay que hacer un build de producción y servirlo:

```bash
npm run build
npx http-server dist/clase-proyecto/browser -p 8080
```

En `http://localhost:8080`, DevTools → *Application → Service Workers* muestra `ngsw-worker.js` activo. Con *Network → Offline* tildado y F5, la app sigue cargando (después destildarlo: si queda tildado, rompe el desarrollo normal).

Creado con `ng new` + `ng add @angular/pwa`. El interceptor salió de `ng generate interceptor`.

## Estructura

```
ngsw-config.json               Qué cachear: "app" con prefetch, "assets" con lazy
public/
├── manifest.webmanifest       Nombre, colores e íconos de la app instalada
├── icons/                     Los que genera ng add (hay que reemplazarlos en un proyecto real)
└── error.svg                  La imagen que pone el interceptor cuando el día es un video
src/
├── environments/              NASA_URL y NASA_KEY
└── app/
    ├── app.config.ts          provideServiceWorker + provideHttpClient(withInterceptors(...))
    ├── interceptors/
    │   └── api-key-interceptor.ts
    ├── services/loading.ts    El signal "cargando" (el interceptor no puede tocar un componente)
    └── foto-del-dia/          Elegís una fecha y trae la foto astronómica del día
```

## Qué mirar

- **`api-key-interceptor.ts`**, de arriba abajo:
  - Si la URL no es la de la NASA, deja pasar la petición sin tocarla.
  - La `api_key` se agrega **clonando** `req` con `params.set`, porque `req` no se puede modificar.
  - `tap` apaga el "cargando" cuando llega la respuesta. No cambia nada.
  - `map` reemplaza el body si el día es un video. Las dos chequean `HttpEventType.Response`.
- **`foto-del-dia.ts`**: el componente no sabe nada de la API key ni de los videos. Pide la fecha y muestra lo que llega.
- **El `error` del `subscribe`** apaga el "cargando". Si la NASA falla, el `tap` del interceptor nunca ve una respuesta, y sin esto el "Cargando…" quedaría para siempre.
- **`api-key-interceptor.spec.ts`**: prueba con `HttpTestingController` que se agregue la key, que se reemplacen los videos y que otras URLs no se toquen.
- **`DEMO_KEY`**: es la clave pública de prueba de la NASA, con un límite de pedidos por hora. Para usar una propia, se pide gratis en [api.nasa.gov](https://api.nasa.gov) y se cambia en `environment.ts`. Ver el punto 8 del apunte sobre por qué va en `environment` aunque no sea secreta.
