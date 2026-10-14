# Clase 12 — NestJS: estructura, controllers, DTO y validaciones

**Fecha:** 13/10/2026 (video subido 14/10/2026) · **Nest:** 12 · **Módulos:** ES modules

Video: *"Clase 12 - NestJS"*, partes 1 y 2. Código del profesor: `clase-12-nest/` del repo de la cursada.

## Qué se dio

- Arranca la segunda parte del cuatrimestre: backend, con foco en **performance y seguridad**
- Nest: qué es, por qué se eligió, cómo se crea un proyecto
- Los cuatro archivos base: `main`, `module`, `controller`, `service`
- Decoradores para rutas y para extraer partes del request
- `nest generate resource`: un CRUD completo con un comando
- Entity vs DTO, y mapped types (`PartialType`, `PickType`, `OmitType`)
- Validaciones con `ValidationPipe`, `class-validator` y `class-transformer`

---

## 1. Qué es Nest y por qué

- Framework de Node, escrito en TypeScript, que usa **Express por dentro** (se puede cambiar por Fastify, no se usa).
- Estructura calcada de Angular: módulos, controllers, servicios, pipes, interceptors. No es lo mismo, pero los conceptos se repiten.
- Se eligió porque está en TypeScript (no se mezclan lenguajes en la cursada) y porque es ordenado y escalable.
- No hay SSR en la cursada.

El profesor lo describe como un híbrido entre Angular y Spring Boot de Java, por la cantidad de decoradores.

## 2. Crear el proyecto

```bash
npm i -g @nestjs/cli
nest new clase-12
```

Respuestas del asistente: gestor `npm`, sistema de módulos **ES modules**, y **"no"** a lo de observabilidad (es un servicio pago que quieren vender).

Dos detalles que marcó:

- `nest new` crea un `.git` dentro del proyecto. Si el repo ya existe por fuera, **hay que borrar ese `.git`**.
- El linter nuevo es `oxlint` (antes ESLint). Sólo marca errores; no se toca.

Arrancar en desarrollo (reinicia al guardar):

```bash
npm run start:dev      # = nest start --watch
```

## 3. Los cuatro archivos

| Archivo | Rol | Equivalente en Angular |
| ------- | --- | ---------------------- |
| `main.ts` | Punto de entrada: crea la app y la levanta en el puerto | `main.ts` |
| `app.module.ts` | Módulo raíz: **agrupa** imports, controllers y providers | `app.config.ts` / componente raíz |
| `*.controller.ts` | Define **rutas y métodos HTTP**; recibe y devuelve | Rutas |
| `*.service.ts` | **Lógica de negocio** | Servicio |

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
```

- El puerto sale primero de `process.env.PORT`. Se deja 3000 por defecto porque es el que usan los deploys.
- El módulo **agrupa**: es la palabra clave. Todo módulo tiene que ser importado por otro y, en cadena, por `AppModule`.
- Un módulo es corto: unos `imports`, `controllers`, `providers` y, si hace falta, `exports`.

### Inyección de dependencias

Por constructor, como en Angular antes de `inject()`:

```typescript
constructor(private readonly appService: AppService) {}
```

Nest crea el service y se lo pasa al controller. En la cátedra la inyección se hace siempre por constructor.

## 4. Controllers y rutas

```typescript
@Controller('app')            // prefijo de todas las rutas del controller
export class AppController {
  @Get()          // GET /app
  @Post('otro')   // POST /app/otro   (la barra inicial no hace falta)
  @Put(':id')     // PUT /app/123
}
```

- El **método HTTP va en el decorador**, no en la ruta.
- Se pueden definir subrutas dentro del decorador del método.

### Sólo recibís lo que pedís

En Express siempre llega `req` y `res`. En Nest **no llega nada** salvo que lo pidas con un decorador. Menos memoria, menos código:

| Decorador | Qué trae |
| --------- | -------- |
| `@Body()` | El body (ya viene parseado como JSON, sin configurar nada) |
| `@Query('page')` | Un query param |
| `@Param('id')` | Un parámetro de ruta |
| `@Headers()`, `@Ip()`, cookies | Lo que indica el nombre |
| `@Req()` / `@Res()` | El objeto completo de Express (último recurso) |

El nombre de la variable no tiene por qué coincidir con el del parámetro: `@Param('id') identificador: string` funciona.

### Status y errores

- `@HttpCode(201)` cambia el status de una ruta.
- Nest **nunca devuelve texto plano ni expone tu código** cuando algo falla: siempre responde un JSON con el error. En Express eso lo tenías que cuidar vos.
- También se pueden agregar headers a la respuesta y redirecciones con decoradores.

## 5. `nest generate resource`

```bash
nest generate resource usuarios      # alias: nest g resource usuarios
```

Elegir **REST API** y generar los puntos de entrada del CRUD. Crea la carpeta `usuarios/` con módulo, controller, service, `entities/` y `dto/`, y **lo importa solo en `AppModule`**.

Comandos individuales (por si ya hay carpeta):

```bash
nest g controller monumento --no-spec
nest g service monumento --no-spec --flat    # --flat: sin carpeta nueva
```

## 6. Entity vs DTO

| | Entity | DTO (*Data Transfer Object*) |
| --- | --- | --- |
| Para qué | Cómo se **guarda** en la base | Cómo **llega** en cada request |
| Campos | Todos: id, `creadoEn`, `modificadoEn`... | Sólo los que manda el cliente en esa acción |
| Lógica | Ninguna | Ninguna: sólo estructura |

Razón de existir: lo que se guarda no es lo que se recibe. El `id` y las fechas los pone el servidor; al crear no llega el id; al modificar quizás no se puede cambiar el email.

Un DTO por cada **body distinto**: crear, modificar, y cualquier acción con otros datos (restablecer contraseña, cambiar mail). No tiene DTO un GET ni, a veces, un DELETE.

### Mapped types

Para no repetir campos entre DTOs:

```typescript
import { PartialType, PickType, OmitType } from '@nestjs/mapped-types';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {}        // todo opcional
export class Otro extends PickType(CreateUsuarioDto, ['nombre', 'apellido'] as const) {}  // sólo esos
export class Otro2 extends OmitType(CreateUsuarioDto, ['email', 'contraseña'] as const) {} // todos menos esos
```

- `PickType` y `OmitType` hacen lo mismo al revés. Se elige según qué te conviene escribir (lo que cambia menos).
- Los tres **heredan también las validaciones**.
- `as const` es sintaxis de TypeScript para que tome el array como lista de claves.
- Respuesta a una pregunta de clase: si un campo (p. ej. `rol`) no se recibe al crear pero sí al modificar, va sólo en el DTO de update.

## 7. Validaciones

Sin configurar nada, el DTO **no valida**: llega cualquier cosa y se castea a la fuerza. Los tipos de TypeScript desaparecen al compilar.

El backend siempre valida, aunque el front ya lo haga: con F12 se puede mandar cualquier cosa.

```bash
npm i class-validator class-transformer
```

**Paso 1** — activar el pipe de validación para toda la app, en `main.ts`:

```typescript
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
```

`whitelist: true` **borra del objeto** las propiedades que no tengan ningún decorador de validación.

**Paso 2** — decorar cada campo del DTO:

```typescript
export class CreateUsuarioDto {
  @IsString() @IsNotEmpty() @MinLength(3) @MaxLength(18)
  nombre: string;

  @IsEmail()
  email: string;

  @IsOptional() @IsNumber()
  edad?: number;
}
```

- Cada variable pasa por la "tubería" de decoradores en orden; el error dice cuál falló.
- Hay decoradores para casi todo: `@IsString`, `@IsNumber`, `@IsInt`, `@Min`, `@Max`, `@IsDate`, `@IsEmail`, `@IsArray`, `@IsEnum`, `@Matches(regex)`...
- Para patrones de texto complejos se usa **`@Matches` con una regex**.
- Un pipe es un "tubo" por donde pasa el dato, igual que en Angular, pero acá transforma o valida la **entrada**.
- No hace falta volver a validar en la base: el DTO ya lo hizo.

### Arrays y objetos anidados

```typescript
@IsArray()
@IsString({ each: true })        // each: valida cada elemento
roles: string[];

// objeto dentro de objeto: se crea otra clase y se anota así
@ValidateNested()
@Type(() => DireccionDto)        // de class-transformer
direccion: DireccionDto;
```

- Sin `@Type`, `@ValidateNested` no hace nada: necesita saber a qué **clase** convertir el objeto. El profesor se trabó acá en vivo.
- `@ArrayNotEmpty()` para exigir al menos un elemento (un array vacío pasa `@IsArray`).
- Se recomienda **una clase nueva por objeto anidado** y no meter 800 validaciones en una línea.

Alternativa mencionada: `zod`. No se usa en esta cursada.

---

## Cosas que confunden

| Síntoma | Causa |
| ------- | ----- |
| Llega cualquier cosa y nunca falla | Falta el `ValidationPipe` global en `main.ts` |
| Con `whitelist: true` el body llega vacío | Los campos no tienen **ningún** decorador de validación; los borra todos |
| `@ValidateNested` no valida el objeto interno | Falta `@Type(() => Clase)` |
| `Cannot access 'X' before initialization` | La clase interna está declarada **después** de la que la usa; ordenar primero la menor |
| `@Param('id')` llega `undefined` | El nombre del decorador no coincide con el de la ruta (`:id`) |
| `+id` en un controller | Casteo rápido a número; si no es número da `NaN`. No es una validación |
| Un módulo nuevo no responde | Falta importarlo en el módulo raíz (o en alguno que lo importe) |

## Referencia rápida

```typescript
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()   create(@Body() dto: CreateUsuarioDto) { ... }
  @Get()    findAll() { ... }
  @Get(':id')  findOne(@Param('id') id: string) { ... }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) { ... }
  @Delete(':id') remove(@Param('id') id: string) { ... }
}
```

## Para el TP 2

- Un módulo por feature (`auth`, `usuarios`, `publicaciones`), generados con `nest g resource`.
- DTOs de registro, login, crear publicación, crear comentario, con `@Matches` para la contraseña (8 caracteres, una mayúscula, un número).
- `whitelist: true` impide que alguien se auto-asigne el perfil de administrador en el registro.
- Lo que **no** se dio y vamos a necesitar se anuncia aparte: subida de archivos, paginación y agregaciones.

## Links

- [Nest — Primeros pasos](https://docs.nestjs.com/first-steps)
- [Controllers](https://docs.nestjs.com/controllers)
- [Providers](https://docs.nestjs.com/providers)
- [Validation](https://docs.nestjs.com/techniques/validation)
- [Mapped types](https://docs.nestjs.com/openapi/mapped-types)
- [class-validator](https://github.com/typestack/class-validator)
