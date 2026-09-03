# Clase 05 — Supabase y autenticación · proyecto

El apunte de la clase está en [`../clase-apunte/apunte.md`](../clase-apunte/apunte.md).

```bash
nvm use
npm ci
npm start        # http://localhost:4200
```

Parte de la clase 04 (catálogo y formularios de Rick and Morty) y le suma registro, ingreso y salida con Supabase Auth. El catálogo es público; `/formulario` y `/episodios` piden sesión.

Usa el proyecto de Supabase de [`../clase-apunte/supabase.md`](../clase-apunte/supabase.md). Si no responde, está pausado por inactividad: se reanuda desde el dashboard con *Restore project*.

## Estructura

```
src/
├── environments/              SUPABASE_URL y SUPABASE_KEY (la publishable)
└── app/
    ├── app.routes.ts          Rutas con canActivate y canActivateChild
    ├── app.ts / app.html      Muestra el usuario actual y el botón de salir
    ├── servicios/
    │   ├── supabase.ts        Crea el cliente una sola vez
    │   └── auth.ts            registrar, loguear, cerrarSesion y onAuthStateChange
    ├── guards/
    │   ├── logueado-guard.ts      Sin sesión → /auth/login
    │   └── deslogueado-guard.ts   Con sesión → / (no deja volver al login)
    └── auth/
        ├── auth.routes.ts     export default, sin .then()
        ├── login/
        └── registro/          El nombre va en options.data
```

## Qué mirar

- **`auth.ts`**: `onAuthStateChange` sólo actualiza el signal `usuarioActual`. No navega: de eso se ocupan el login y el botón de salir (ver "Otra: el `navigateByUrl`…" en el apunte).
- **`logueado-guard.ts`**: espera a `getSession()` en vez de leer el signal. Así, apretar F5 en `/formulario` no te manda al login (ver "La trampa" en el apunte). El de la cátedra lee `usuarioActual()`.
- **`login.ts` y `registro.ts`**: `signUp` y `signInWithPassword` no tiran excepción; se mira el `error` de la respuesta y se muestra su mensaje.
- **`registro.ts`**: si el proyecto tiene activada la confirmación por correo, `signUp` devuelve el usuario **sin sesión**. Ahí se avisa que revise el correo en vez de navegar.
- **`app.html`**: el nombre sale de `user_metadata['nombre']`, que es donde queda lo que se mandó en `options.data`.

## Diferencias con el código de la cátedra

| Acá | En la cátedra | Por qué |
| --- | ------------- | ------- |
| El guard espera `getSession()` | El guard lee el signal | El signal está vacío hasta que se restaura la sesión |
| Navega el login | Navega `onAuthStateChange` | Así no te saca de la ruta cuando se renueva el token |
| `deslogueadoGuard` en `auth` | Quedó como comentario ("debería agregar un canActivate…") | No tiene sentido entrar al login con sesión |
