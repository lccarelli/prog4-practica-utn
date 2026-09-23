# Clase 10 — Notificaciones push · proyecto

El apunte de la clase está en [`../clase-apunte/apunte.md`](../clase-apunte/apunte.md).

```bash
nvm use
npm ci
npm start        # muestra que el Service Worker está apagado: en desarrollo no corre
```

Creado con `ng new` + `ng add @angular/pwa`. La suscripción salió de `ng generate component`.

## Para probarlo de punta a punta

1. **Tabla**: ejecutar [`../clase-apunte/notificaciones.sql`](../clase-apunte/notificaciones.sql) en el SQL Editor de Supabase.
2. **Secrets**: en *Edge Functions → Secrets*, cargar `VAPID_PUBLIC`, `VAPID_SECRET` y `VAPID_MAIL`. Los valores están en `secretos.local.md`, en la raíz del repo, que no se commitea. La pública es la misma que está en `src/environments/`.
3. **Función**: *Edge Functions → Deploy a new function → Via editor*, nombre `enviar-notificacion`, pegar [`edge-function/enviar-notificacion.ts`](edge-function/enviar-notificacion.ts) y desplegar.
4. **App**: tiene que correr con el Service Worker, o sea en un build de producción:
   ```bash
   npm run build
   npx http-server dist/clase-proyecto/browser -p 8080
   ```
   En `http://localhost:8080`, tocar "Sí" y aceptar el permiso. En la tabla aparece la fila.
5. **Enviar**: un `POST` a `https://vrkcaykkxfyfgntmqmji.supabase.co/functions/v1/enviar-notificacion` desde Postman, con los headers que muestra el editor de la función (`Authorization: Bearer <publishable>`, `apikey: <publishable>`).

Para que llegue desde el celular, hay que deployarlo (Vercel, Root Directory `clase-10-notificaciones/clase-proyecto`). `localhost` sólo sirve en la misma compu.

## Estructura

```
edge-function/
└── enviar-notificacion.ts     Lee las suscripciones y manda con web-push (no la compila Angular)
src/
├── environments/              Supabase + VAPID_PUBLIC
└── app/
    ├── services/supabase.ts
    └── suscripcion/           Botón propio → permiso del navegador → guarda en Supabase
```

## Qué mirar

- **`suscripcion.ts`**:
  - `isEnabled` antes que nada: en `ng serve` da `false`.
  - `requestSubscription` con la VAPID pública.
  - De `toJSON()` salen `endpoint`, `keys['auth']` y `keys['p256dh']`, con corchetes.
- **La doble pregunta**: el cartel del navegador aparece recién después del "Sí" propio. Si el usuario bloquea el del navegador, no se puede volver a mostrar (ver el punto 5 del apunte).
- **`try/catch` alrededor de `requestSubscription`** (*no se dio en clase*): si el usuario rechaza el permiso, la promesa tira una excepción y corta el método. Sin el `catch` no hay forma de mostrar "No vas a recibir notificaciones". El código de la cátedra no maneja ese caso.
- **`notificaciones.sql`**: `p256dh` es `unique`, para que tocar "Sí" dos veces no duplique la suscripción. Como hay RLS, `anon` sólo puede insertar; nunca leer.
- **`enviar-notificacion.ts`**:
  - `for...of` con **`await`** en cada `sendNotification`. Al de la cátedra le falta el `await`, y la función puede terminar antes de que salgan los envíos.
  - El contenido va dentro de `notification`, que es el formato que entiende el Service Worker de Angular, y pasado por `JSON.stringify`.
  - El mail va como `mailto:`.
