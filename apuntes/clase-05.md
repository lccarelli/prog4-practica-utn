# Clase 05 — Supabase y autenticación

**Fecha:** 01/09/2026 · **Angular:** 22.1.0 · **@supabase/supabase-js:** ^2.112.4

Video: *"Clase 05 - Auth, Guards y EL TP"*, partes 1 y 2.

## Qué se dio

- Supabase: proyecto y cliente
- Registro, login y cierre de sesión
- `onAuthStateChange`
- Guards de ruta
- Rutas hijas con `export default`

---

## 1. Instalación

```bash
npm install @supabase/supabase-js
```

No hace falta ningún `provide...` en `app.config.ts`. El cliente se crea a mano
dentro de un servicio.

## 2. Las claves van en environments

```typescript
// src/environments/environment.ts
export const environment = {
  SUPABASE_URL: 'https://xxxx.supabase.co',
  SUPABASE_KEY: 'sb_publishable_...',
};
```

**Esa clave se commitea y está bien.** La *publishable key* viaja en el bundle
que descarga cualquier visitante: es pública por diseño. Lo que impide que
alguien haga desastres es Row Level Security, no el secreto de la clave.

La que **nunca** va al front es la `sb_secret_...` (service role), que saltea RLS
por completo.

Los datos del proyecto propio están en [`supabase.md`](supabase.md).

## 3. El servicio que envuelve el cliente

```typescript
@Service()
export class Supabase {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.SUPABASE_URL, environment.SUPABASE_KEY);
  }

  public get Supabase() {
    return this.supabase;
  }
}
```

Un servicio con `providedIn: 'root'` es un **singleton**: se crea una sola
instancia para toda la aplicación. Importa acá, porque `createClient` abre
conexiones y maneja la sesión — crear varios clientes trae problemas raros.

El `private` con un getter público deja leer el cliente pero no reemplazarlo.

## 4. Registro, login y salida

```typescript
async registrar(usuario: IUsuario) {
  return await this.supabaseS.Supabase.auth.signUp({
    email: usuario.email,
    password: usuario.password,
    options: {
      data: { nombre: usuario.nombre },
    },
  });
}

async loguear(usuario: IUsuario) {
  return await this.supabaseS.Supabase.auth.signInWithPassword({
    email: usuario.email,
    password: usuario.password,
  });
}

async cerrarSesion() {
  return await this.supabaseS.Supabase.auth.signOut();
}
```

**`options.data` es para los datos extra.** La tabla de usuarios de Supabase
tiene email y contraseña y poco más; todo lo demás (nombre, fecha de nacimiento,
lo que pida el TP) va ahí y queda en `user.user_metadata`.

Estos métodos **no tiran excepción**: devuelven `{ data, error }`. Hay que mirar
el `error`, no envolver en try/catch.

## 5. `onAuthStateChange`: la pieza central

```typescript
constructor() {
  this.supabaseS.Supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      this.usuarioActual.set(session.user);
      this.routerS.navigateByUrl('/home');
    } else {
      this.usuarioActual.set(null);
      this.routerS.navigateByUrl('/auth/login');
    }
  });
}
```

Se suscribe una vez, en el constructor del servicio, y **se dispara solo** en
cada cambio de sesión: al abrir la aplicación, al registrarse, al loguearse, al
cerrar sesión, y cuando el token se renueva.

Por eso en el código de la cátedra quedaron comentadas las líneas que seteaban
el usuario a mano después de cada login: **eran redundantes**. Es el "aha" de la
clase — un solo lugar decide quién está logueado, en vez de repetirlo en cada
método.

El estado se guarda en un signal:

```typescript
public usuarioActual: WritableSignal<User | null> = signal<User | null>(null);
```

Así cualquier componente lo lee con `usuarioActual()` y se actualiza solo.

## 6. Guards

Un guard decide si se puede entrar a una ruta. Desde Angular 15 son funciones,
no clases:

```typescript
export const logueadoGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authS = inject(Auth);

  if (authS.usuarioActual() !== null) {
    return true;
  }

  return router.navigateByUrl('/auth/login');
};
```

Devuelve `true` para dejar pasar, o `false` / una redirección para frenar.

```typescript
{
  path: 'home',
  loadComponent: () => import('./home/home').then((m) => m.Home),
  canActivate: [logueadoGuard],
}
```

- **`canActivate`** protege esa ruta.
- **`canActivateChild`** protege las hijas.

El `inject()` funciona adentro del guard porque Angular lo ejecuta en un
contexto de inyección. En una función suelta cualquiera, no.

Angular 19 sumó `RedirectCommand` como forma más explícita de redirigir:

```typescript
return new RedirectCommand(router.parseUrl('/auth/login'));
```

## 7. Rutas hijas con `export default`

```typescript
// auth/auth.routes.ts
const authRoutes: Routes = [ ... ];
export default authRoutes;
```

```typescript
{
  path: 'auth',
  loadChildren: () => import('./auth/auth.routes'),
}
```

Fijate que **no hay `.then((m) => m.algo)`**. Cuando el archivo usa
`export default`, Angular toma esa exportación sola. Con export nombrado hay que
escribir el `.then`.

---

## La trampa: la carrera entre el guard y la sesión

Esto vale la pena entenderlo antes de que te pase.

El guard lee `usuarioActual()` **de forma sincrónica**. Pero al abrir la
aplicación, la sesión guardada en el navegador se restaura **de forma
asincrónica**: `createClient` la lee del `localStorage` y recién después
`onAuthStateChange` dispara con `INITIAL_SESSION`.

O sea: si estás logueada y apretás **F5 estando en `/home`**, es probable que el
guard corra antes de que la sesión se haya restaurado, vea `null`, y te patee al
login aunque tu sesión sea perfectamente válida.

Se prueba en dos segundos: logueate, andá a `/home`, y refrescá con F5.

La salida es que el guard **espere** la sesión en vez de leer un signal que
todavía no se llenó:

```typescript
export const logueadoGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const supabase = inject(Supabase);

  const { data } = await supabase.Supabase.auth.getSession();
  return data.session ? true : router.parseUrl('/auth/login');
};
```

Un guard puede devolver una promesa; Angular la espera. En el código de la
cátedra quedó comentado justamente un `getSession()` en el constructor, que
apuntaba a este mismo problema.

## Otra: el `navigateByUrl` dentro de `onAuthStateChange`

Ese `navigateByUrl('/home')` se ejecuta en **cada** cambio de sesión, incluido
el de la carga inicial y el de la renovación del token. Consecuencias:

- Si entrás con un link directo a otra ruta, te manda igual a `/home`.
- Si el token se renueva mientras navegás, te puede sacar de donde estabas.

Para el TP conviene navegar **desde el login**, después de un ingreso exitoso, y
dejar que `onAuthStateChange` sólo actualice el estado.

---

## Cosas que confunden

| Síntoma | Causa |
| ------- | ----- |
| Refresco en `/home` y me manda al login | El guard leyó el signal antes de que se restaurara la sesión |
| El registro "anda" pero no entra | `signUp` no tira excepción: hay que mirar `error` en la respuesta |
| Me pide confirmar el mail y no puedo entrar | Supabase trae la confirmación por correo activada por defecto |
| Los datos extra del usuario no aparecen | Van en `options.data` y se leen en `user.user_metadata` |
| El guard no puede inyectar servicios | Se lo llamó fuera del contexto de inyección de Angular |
| `loadChildren` no encuentra las rutas | Falta el `.then()`, o falta el `export default` en el archivo |
| Entro al login estando logueada | Falta un guard inverso en la ruta `auth` |
| Creé una tabla y no puedo leer ni mis propios datos | RLS viene activado y sin políticas: hay que escribirlas |

## Referencia rápida

```typescript
// Cliente
createClient(environment.SUPABASE_URL, environment.SUPABASE_KEY);

// Auth
auth.signUp({ email, password, options: { data: { nombre } } });
auth.signInWithPassword({ email, password });
auth.signOut();
auth.getSession();
auth.onAuthStateChange((event, session) => { ... });

// Guard
export const miGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  return condicion ? true : router.parseUrl('/otra-ruta');
};
```

```typescript
{ path: 'x', canActivate: [miGuard] }        // esta ruta
{ path: 'x', canActivateChild: [miGuard] }   // las hijas
```

## Links

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Angular con Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/angular)
- [Guards](https://angular.dev/guide/routing/route-guards)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
