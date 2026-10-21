# Clase 14 — JWT con NestJS

**Fecha:** 20/10/2026 · **Paquetes:** `jsonwebtoken`, `@nestjs/config`

Video: *"Clase 14 - JWT"*, partes 1 y 2, y *"Clase 14 - TP2"*, parte 3. Código del profesor: `clase-14-jwt/` del repo de la cursada.

## Qué se dio

- Autenticar y autorizar, y por qué hace falta un token en una API REST
- Las tres partes de un JWT, los *claims* y cómo la firma da la seguridad
- Generar el token con `jwt.sign` en el registro y el login
- Variables de entorno en Nest con `ConfigModule`
- Un **guard** que verifica el token del header `Authorization: Bearer`
- Entregar el token en una **cookie** (leerla quedó para la clase 15)
- La consigna del TP 2 y sus fechas

---

## 1. Autenticar y autorizar

| | Pregunta | Ejemplo |
| --- | --- | --- |
| **Autenticar** | ¿Quién sos? | Iniciar sesión con usuario y contraseña |
| **Autorizar** | ¿Tenés el permiso o el rol? | Que el profe vea "activar edición" en el aula virtual y vos no |

En el TP 1 eso lo resolvían las RLS de Supabase. Acá no hay Supabase: lo hace nuestro servidor.

**El problema:** una API REST **no guarda estado**, así que en cada petición hay que decir quién sos. Mandar usuario y contraseña cada vez sería una alerta de seguridad máxima. Hace falta algo que los reemplace y que no tenga datos sensibles: el **token**, una especie de credencial.

El circuito:

1. **Registro**: revisar que el usuario no exista, que la contraseña sea segura, encriptarla y guardarla. A veces ya devuelve el token.
2. **Login**: revisar que el usuario exista, comparar la contraseña encriptada y **devolver el token**.
3. **Cada petición siguiente** manda el token. El servidor lo valida, mira los permisos y deja pasar o no.

Se generan tokens sólo en el registro y el login (o en otra forma de entrar, como "olvidé mi contraseña"). Validarlo es un **middleware**: si pasa, pasa; si no, corta.

## 2. Las tres partes del JWT

`encabezado.payload.firma`: tres strings separados por puntos.

**Encabezado.** Metadata; es casi siempre el mismo:

```json
{ "typ": "JWT", "alg": "HS256" }
```

**Payload ("cuerpo", la carga).** Los datos. Algunos son *claims* estándar, todos opcionales:

| Claim | Qué guarda |
| ----- | ---------- |
| `iss` | Quién emitió el token |
| `sub` | El motivo o el sujeto |
| `aud` | A quién va dirigido |
| `exp` | **Cuándo vence**. Para nosotros, obligatorio |
| `nbf` | No válido antes de esa fecha |
| `iat` | Cuándo se creó |
| `jti` | Un id del token |

`iat` y `exp` van en **segundos desde el 1/1/1970** (tiempo Unix). Además se puede agregar cualquier dato público: nombre, id, **rol**. **Nunca** datos sensibles, ni siquiera la contraseña encriptada, porque se podría intentar romperla por fuerza bruta.

**Firma.** Es lo que da la seguridad. Es el resultado de pasar **encabezado + payload + la clave secreta del servidor** por el algoritmo (HS256). Así:

- Sólo nuestro servidor puede **crear** tokens válidos y sólo él puede **validarlos**, porque es el único que tiene la clave.
- Si alguien cambia una letra del payload (por ejemplo `admin: false` → `true`), la firma recalculada ya no coincide y el token no sirve. Misma entrada, misma salida; otra entrada, otra salida.
- Cada login da un token distinto, porque `iat` y `exp` cambian.

Encabezado y payload se pasan a **base64**. Eso **no es encriptar**: es reversible y sólo cambia el formato, más corto que el JSON. Por eso empiezan con `eyJ`, que es `{"` en base64. En [jwt.io](https://jwt.io) se lee cualquier token. Lo mostró con el de Supabase que quedaba en el `localStorage` del TP 1. Sin la clave, jwt.io no puede decir que la firma es válida.

> "La seguridad no es ocultar de quién es el token, es ocultar cómo yo sé de quién es el token."

## 3. Generar el token

```bash
nest g resource dibujo          # el recurso a proteger (REST API)
nest g resource auth            # sin CRUD: sólo registro y login
npm i jsonwebtoken
npm i -D @types/jsonwebtoken    # los tipos van en desarrollo
```

Sobre `@types/...`: `jsonwebtoken` está escrito en JavaScript (CommonJS). El paquete de tipos le agrega el `index.d.ts` para TypeScript. Va con `-D` porque TypeScript es sólo de desarrollo.

```typescript
// auth.controller.ts
@Post('registro')
registro(@Body() body: { user: string; pass: string }) {
  return this.authService.registro(body);
}
```

El profe aclaró que **debería ser un DTO** y lo salteó para ir al punto.

```typescript
// auth.service.ts
import jwt from 'jsonwebtoken';

generarToken(user: string) {
  const fechaActual = Math.round(Date.now() / 1000);

  const payload = {
    user,
    iat: fechaActual,
    exp: fechaActual + 60 * 15,     // 15 minutos: lo normal
  };

  return jwt.sign(payload, CONTRASEÑA_DEL_SERVER, { issuer: 'MI SERVER' });
}
```

- `jwt.sign(payload, clave, opciones)`. Las opciones (`issuer`, `expiresIn`, `algorithm`...) son otra forma de cargar los claims; da lo mismo ponerlos en el payload o ahí. El encabezado lo arma solo.
- **Error en vivo:** primero puso `Date.now()` sin dividir y jwt.io mostró que el token se había creado en el año 58773. `Date.now()` está en **milisegundos**; hay que dividir por 1000. Después notó que quedaba un decimal: le faltó redondear.
- La guía de Nest usa `passport`. El profe prefiere hacerlo a mano con `jsonwebtoken` para entender lo nuevo.
- Lo probó con Postman: `POST /auth/registro` con `{ "user": "Agus", "password": ... }` y pegó el token en jwt.io.

## 4. Variables de entorno: `@nestjs/config`

La clave del servidor va en el `.env`:

```
CONTRASEÑA_DEL_SERVER="la clave secreta"
```

Nest no lee el `.env` solo. Hace falta un paquete:

```bash
npm i @nestjs/config
```

```typescript
// app.module.ts
imports: [ConfigModule.forRoot(), DibujoModule, AuthModule],   // primero, para que levante antes
```

Después se lee con `process.env.NOMBRE`. TypeScript avisa que puede ser `undefined`, así que se le da un valor por defecto: `process.env.X || 'algo'`. Lo mismo va para la URI de Mongo de la clase 13: todo lo que cambia según el ambiente va al `.env`, y en el deploy se configura desde la plataforma.

## 5. El guard

Un guard es un middleware de **responsabilidad única**: deja pasar (`true`) o no (`false`), igual que en Angular. Pensado para autenticar y autorizar.

```bash
nest g guard auth/token
```

**No hace falta registrarlo en ningún módulo**: se importa donde se usa.

```typescript
@Controller('dibujo')
@UseGuards(TokenGuard)      // todas las rutas del controller
export class DibujoController { ... }
```

`@UseGuards` va en un controller, en una ruta, o global.

Pregunta de clase: ¿qué pasa si todavía no hay token? No se puede entrar a `/dibujo` sin loguearse primero. El token se genera en **una** petición (login) y se usa en **las siguientes**.

### Dónde viaja el token

Si se devuelve en el body, el front lo guarda (en `localStorage`) y lo manda en cada petición en un **encabezado**, por convención:

```
Authorization: Bearer <token>
```

En Postman, la pestaña *Authorization* → *Bearer Token* arma ese header sola.

```typescript
canActivate(context: ExecutionContext) {
  const req: Request = context.switchToHttp().getRequest();   // Request de express
  const token = req.headers.authorization?.replace('Bearer ', '');
  // también: split(' ')[1] o substring(7)

  if (!token) return false;

  try {
    const payload = jwt.verify(token, CONTRASEÑA_DEL_SERVER);
    req.body.user = (payload as { user: string }).user;
    return true;
  } catch (err) {
    throw new ForbiddenException('Tóken no válido');
  }
}
```

- `switchToHttp()`: Nest también sirve para microservicios (RPC) y websockets, así que hay que decirle que es HTTP antes de pedir la request.
- **`jwt.verify` y no `jwt.decode`**. `decode` devuelve el payload **sin verificar la firma**: no sirve para esto. `verify` recalcula la firma y controla el vencimiento. Si algo falla, lanza un error.
- En vivo, `import { verify } from 'jsonwebtoken'` tiró que el paquete "no exporta verify" (es CommonJS). Lo resolvió con `import jwt from 'jsonwebtoken'` y `jwt.verify`.
- **Lo que probó:**
  - El token de antes del recreo ya había vencido (15 minutos contra 30 de recreo).
  - Borrar un carácter de la firma da *invalid signature*, y tocar el principio da token mal formado.
  - Con `exp` en `+ 1` y esperando 2 segundos da *TokenExpiredError*.
- **Status:** si el guard devuelve `false`, Nest responde **403 Forbidden**, el error genérico de cualquier guard. Con `throw new ForbiddenException('mensaje')` se cambia el texto. Hay excepciones para cada status. Personalizar errores lo deja para otra clase.
- **Pasar datos al controller**: el guard ya decodificó el token, así que deja el `user` en `req.body` para no decodificarlo de nuevo. Hay muchas formas de hacerlo; no le hizo hincapié.

## 6. Token en una cookie

La alternativa a devolverlo en el body: el servidor lo deja en una **cookie**, y el navegador la manda sola en cada petición a ese servidor.

```typescript
@Post('login')
login(@Body() body, @Res({ passthrough: true }) response: Response) {
  const token = this.authService.login(body);

  response.cookie('token', token, {
    httpOnly: true,       // el JavaScript del front no la puede leer
    sameSite: 'strict',   // sólo se usa desde el mismo sitio
    secure: true,         // sólo por https
    expires: new Date(Date.now() + 1000 * 60 * 15),   // acá pide un Date, en ms
  });
  return token;
}
```

- Si pedís `@Res()`, Nest entiende que respondés vos: hay que usar `response.send()`. Con `{ passthrough: true }` el `return` vuelve a funcionar.
- En vivo, `response` daba `undefined`: se había olvidado de pedir `@Res()`.
- Se queja de que cada cosa pide la fecha en un formato distinto: el token en segundos, la cookie un `Date`.

**Leer la cookie en el guard (`req.cookies.token`) no funcionó en clase**: daba `undefined`. Al final se acordó de que **falta `cookie-parser`**, el middleware que parsea las cookies (como `express.json` para el body). Quedó para la clase 15, junto con conectarlo al front.

---

## Cosas que confunden

| Síntoma | Causa |
| ------- | ----- |
| El token dice que se creó en el año 58773 | `Date.now()` en ms; hay que dividir por 1000 |
| Token vencido justo después del recreo | `exp` a 15 minutos |
| *invalid signature* | El token fue modificado, o se firmó con otra clave |
| `jsonwebtoken` "no exporta verify" | Usar `import jwt from 'jsonwebtoken'` y `jwt.verify` |
| No hay tipos para `jsonwebtoken` | Falta `npm i -D @types/jsonwebtoken` |
| Siempre 403 aunque el token sea válido | Header mal armado: falta `Bearer ` o el espacio |
| `process.env.X` es `undefined` | Falta `ConfigModule.forRoot()` |
| `response` es `undefined` | No se pidió `@Res()` |
| El `return` no responde nada | Se pidió `@Res()` sin `passthrough: true` |
| `req.cookies` es `undefined` | Falta `cookie-parser` (clase 15) |

**Una que no salió en clase.** Si la clave se lee en una constante arriba del archivo (`const CLAVE = process.env.X || 'por defecto'`), se evalúa al **importar** el archivo, antes de que `ConfigModule.forRoot()` cargue el `.env`, y queda siempre el valor por defecto. Lo probamos en el proyecto. Anda igual porque firma y verifica con la misma clave, pero la del `.env` no se usa. Hay que leer `process.env` dentro de la función.

## Referencia rápida

```typescript
const token = jwt.sign({ user, iat, exp }, clave, { issuer: 'MI SERVER' });
const payload = jwt.verify(token, clave);       // lanza si es inválido o venció
jwt.decode(token);                              // sólo lee: NO verifica
```

```typescript
response.cookie('token', token, { httpOnly: true, sameSite: 'strict', secure: true, expires });
```

## TP 2 (parte 3 del video)

- **Red social** propia: **no** copiar Twitter, Instagram ni Facebook. Sin emojis y con modales en vez de `alert`. El diseño hay que trabajarlo, como en el TP 1.
- Dos proyectos: front en **Angular**, back en **Nest**, base en **Mongo**. Login y registro contra Nest con **JWT**. Respuestas con el **status correcto** (400, 401, 201...): un error con 200 está mal.
- Repo con el mismo nombre que el TP 1 pero `TP2`, y sumar al profe y a Nat.
- La consigna está explicada paso a paso, por sprints:
  - **Sprint 1:** login y registro, sin JWT todavía.
  - **JWT y seguridad:** en el sprint 3, "creo", dijo el profe. Ahí también entran comentarios y likes.
  - **Sprint 4:** el administrador, con su dashboard.
- **Encriptar contraseñas no se da**: es de Programación 3.
- **Fechas:**
  - Entrega: **jueves 26/11**.
  - Correcciones semanales sugeridas: 5/11, 12/11, 19/11 y 26/11. El 22/10 y el 29/10 no se corrige.
  - Última fecha para promocionar: **3/12**, la semana de recuperatorios. Ese día o el 1/12 se recupera cada TP, uno por día.
  - Como final: **10/12**.
- **Promoción:** los sprints 1 a 4. El quinto se nombró en relación con el recuperatorio y el final, pero en el audio no queda claro.
- El jueves 22/10 no hubo clase por finales.

## Links

- [RFC 7519 — JWT](https://www.rfc-editor.org/rfc/rfc7519)
- [jwt.io](https://jwt.io)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [Nest — Guards](https://docs.nestjs.com/guards)
- [Nest — Configuration](https://docs.nestjs.com/techniques/configuration)
- [Nest — Cookies](https://docs.nestjs.com/techniques/cookies)
