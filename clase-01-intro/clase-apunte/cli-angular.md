# Referencia del CLI de Angular

Verificado contra **Angular CLI 22.1.5**. Los nombres de archivo y de clase que
figuran acá salen de correr los comandos, no de la documentación.

## Crear el proyecto

```bash
ng new mi-app
```

Hace tres preguntas. Las respuestas de la cátedra:

| Pregunta                  | Respuesta |
| ------------------------- | --------- |
| Stylesheet system         | CSS       |
| SSR / SSG (prerendering)  | No        |
| Configuración de IA       | none      |

Para saltear el modo interactivo:

```bash
ng new mi-app --style=css --ssr=false --ai-config=none --routing
```

### Flags de `ng new`

| Flag                | Para qué                                                       |
| ------------------- | -------------------------------------------------------------- |
| `--style`           | `css`, `scss`, `sass`, `less` o `tailwind`                      |
| `--ssr`             | Server-side rendering. La cátedra usa `false`                   |
| `--ai-config`       | `none` para no generar archivos de instrucciones de IA          |
| `--routing`         | Crea `app.routes.ts` y registra el Router                       |
| `--skip-git`        | No inicializa repositorio                                       |
| `--skip-tests`      | No genera archivos `.spec.ts`                                   |
| `--skip-install`    | No corre `npm install`                                          |
| `--test-runner`     | `vitest` (default en 22) o `karma`                              |
| `--package-manager` | `npm`, `pnpm`, `yarn` o `bun`                                   |
| `--prefix`          | Prefijo de los selectores. Default `app`                        |
| `--zoneless`        | Sin `zone.js`. En 22 ya es el comportamiento por defecto        |
| `--dry-run`         | Muestra qué crearía sin escribir nada                           |

**`--directory` se interpreta relativo al directorio actual.** Pasarle una ruta
absoluta crea el árbol completo anidado adentro. Conviene pararse en la carpeta
padre y usar sólo el nombre.

## Día a día

```bash
ng serve            # servidor de desarrollo — alias: ng s, ng dev
ng build            # compila a dist/ — alias: ng b
ng test             # tests — alias: ng t
ng lint             # linter (requiere haber agregado ESLint)
ng version          # versiones instaladas — alias: ng v
ng help             # y --help en cualquier subcomando
```

## Generar

`ng generate <schematic> <ruta/nombre>`, o `ng g` abreviado.

| Schematic     | Alias | Para qué                                         |
| ------------- | ----- | ------------------------------------------------ |
| `component`   | `c`   | Componente                                       |
| `service`     | `s`   | Servicio inyectable                              |
| `guard`       | `g`   | Guard de ruta                                    |
| `pipe`        | `p`   | Pipe de transformación                           |
| `directive`   | `d`   | Directiva                                        |
| `interface`   | `i`   | Interfaz de TypeScript                           |
| `class`       | `cl`  | Clase                                            |
| `enum`        | `e`   | Enum                                             |
| `interceptor` | —     | Interceptor de HTTP                              |
| `resolver`    | `r`   | Resolver: precarga datos antes de activar la ruta |
| `module`      | `m`   | NgModule (no se usa en 22, todo es standalone)   |
| `environments`| —     | Archivos de entorno                              |
| `service-worker` | —  | Convierte la app en PWA                          |
| `web-worker`  | —     | Worker para tareas pesadas                       |
| `library`     | `lib` | Librería dentro del workspace                    |
| `application` | `app` | Otra aplicación en el mismo workspace            |

La ruta es relativa a `src/app`. `ng g c pages/inicio` crea
`src/app/pages/inicio/`.

## Qué genera cada uno

Corriendo cada comando desde la raíz del proyecto:

| Comando                            | Archivos                                             | Exporta                     |
| ---------------------------------- | ---------------------------------------------------- | --------------------------- |
| `ng g c pages/inicio`              | `pages/inicio/inicio.{ts,html,css,spec.ts}`          | `class Inicio`              |
| `ng g s servicios/datos`           | `servicios/datos.ts` + `.spec.ts`                    | `class Datos`               |
| `ng g guard guards/auth`           | `guards/auth-guard.ts` + `.spec.ts`                  | `const authGuard`           |
| `ng g p pipes/capitalizar`         | `pipes/capitalizar-pipe.ts` + `.spec.ts`             | `class CapitalizarPipe`     |
| `ng g d directivas/resaltar`       | `directivas/resaltar.ts` + `.spec.ts`                | `class Resaltar`            |
| `ng g i interfaces/usuario`        | `interfaces/usuario.ts`                              | `interface Usuario`         |
| `ng g cl clases/persona`           | `clases/persona.ts` + `.spec.ts`                     | `class Persona`             |
| `ng g e enums/rol`                 | `enums/rol.ts`                                       | `enum Rol`                  |
| `ng g interceptor interceptors/token` | `interceptors/token-interceptor.ts` + `.spec.ts`  | `const tokenInterceptor`    |
| `ng g r resolvers/usuario`         | `resolvers/usuario-resolver.ts` + `.spec.ts`         | `const usuarioResolver`     |

**El sufijo en el nombre del archivo no es consistente.** Guard, pipe,
interceptor y resolver lo llevan (`auth-guard.ts`); componente, servicio,
directiva, interfaz, clase y enum no (`datos.ts`). Es así por el style guide
2025, que sacó el sufijo de los tipos más frecuentes.

**Guards, interceptors y resolvers son funciones, no clases.** Se generan como
`const` con un tipo (`CanActivateFn`, `HttpInterceptorFn`, `ResolveFn`). Los
guards de clase con `implements CanActivate` son de versiones viejas.

**El servicio usa `@Service()`, no `@Injectable()`:**

```typescript
import { Service } from '@angular/core';

@Service()
export class Datos {}
```

`@Service` es nuevo en Angular 22 y ya implica que el servicio está disponible
en toda la aplicación. Para el decorador de siempre, `ng g s datos --injectable`:

```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Api {}
```

Los ejemplos de la cátedra del cuatrimestre pasado usan `@Injectable`, porque
son de Angular 21.

## Opciones útiles

| Flag                 | Para qué                                                        |
| -------------------- | --------------------------------------------------------------- |
| `--dry-run` / `-d`   | Muestra qué crearía sin escribir. Vale la pena antes de tocar algo |
| `--defaults`         | Sin prompts: toma el default de cada opción                     |
| `--skip-tests`       | No genera el `.spec.ts`                                          |
| `--flat`             | Sin carpeta propia                                               |
| `--force`            | Sobrescribe si el archivo ya existe                              |

**`--flat` tiene default distinto según el schematic.** El componente crea
carpeta (`--flat false`); servicio, guard y pipe **no** (`--flat true`). Para
que un servicio tenga su carpeta: `ng g s datos --flat false`.

### Sólo para componentes

| Flag                  | Para qué                                                  |
| --------------------- | ---------------------------------------------------------- |
| `--inline-template` / `-t` | El HTML adentro del `.ts`                             |
| `--inline-style` / `-s`    | El CSS adentro del `.ts`                              |
| `--selector`          | Selector a medida en lugar del generado                    |
| `--change-detection`  | `OnPush` (default en 22) o `Eager`                         |
| `--display-block` / `-b` | Agrega `:host { display: block }` al CSS                |
| `--export-default`    | `export default` en lugar de export nombrado               |

### Sólo para guards

```bash
ng g guard guards/auth --implements CanActivate,CanDeactivate
```

Opciones: `CanActivate`, `CanActivateChild`, `CanDeactivate`, `CanMatch`. Sin
el flag abre un prompt. Con `--defaults` toma `CanActivate`.

## Agregar y actualizar librerías

```bash
ng add angular-eslint          # linter
ng add @angular/pwa            # service worker y manifest
ng update                      # lista qué se puede actualizar
ng update @angular/core @angular/cli
```

`ng add` no es sólo `npm install`: corre un schematic que además cablea la
configuración. Por eso `ng add angular-eslint` deja el `eslint.config.js` y el
target de lint en `angular.json` listos.

**El paquete del linter es `angular-eslint`, no `@angular/eslint`.** Se renombró
en la v18 y el nombre viejo falla con "Unable to load package information from
registry".

## Cosas que confunden

| Síntoma | Causa |
| ------- | ----- |
| El proyecto quedó en una ruta anidada rarísima | `--directory` con ruta absoluta; es relativo al cwd |
| `ng` no existe o da otra versión | Cada versión de Node tiene sus propios paquetes globales |
| Instalé el CLI y me dio la versión anterior | Node impar: npm baja a la última compatible sin fallar |
| El comando se queda colgado | Está esperando un prompt. Agregar `--defaults` |
| El servicio quedó suelto sin carpeta | Es el default de `--flat` para servicios |
| `@Service` no lo reconozco | Es nuevo en Angular 22; con `--injectable` sale `@Injectable` |

## Links

- [Referencia del CLI](https://angular.dev/cli)
- [ng generate](https://angular.dev/cli/generate)
- [Style guide](https://angular.dev/style-guide)
