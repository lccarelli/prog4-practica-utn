# Clase 14 — JWT · proyecto

El apunte de la clase está en [`../clase-apunte/apunte.md`](../clase-apunte/apunte.md).

```bash
nvm use
npm ci
cp .env.example .env     # y cambiar CONTRASENA_DEL_SERVER
npm run start:dev        # http://localhost:3000
npm run test:e2e         # el recorrido completo, sin base
```

Hecho con `nest new` (npm, ES modules, sin observabilidad), `nest g resource dibujo` (REST API), `nest g module|controller|service auth` y `nest g guard auth/token`. No hay base: como en clase, registro y login sólo generan el token.

## Estructura

```
src/
├── app.module.ts            ConfigModule.forRoot() para leer el .env
├── auth/
│   ├── auth.controller.ts   POST /auth/registro y /auth/login (este también setea la cookie)
│   ├── auth.service.ts      generarToken: payload con user, iat, exp (en segundos) e issuer
│   ├── dto/login.dto.ts     user y pass
│   └── token/token.guard.ts lee Authorization: Bearer, jwt.verify, deja el user en el body
└── dibujo/                  CRUD generado, todo protegido con @UseGuards(TokenGuard)
test/auth.e2e-spec.ts        un caso por cosa que se probó en clase con Postman
```

## Probarlo

```bash
TOKEN=$(curl -s -X POST localhost:3000/auth/registro -H 'Content-Type: application/json' \
  -d '{"user":"laura","pass":"1234"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).token')
curl localhost:3000/dibujo                                   # 401
curl localhost:3000/dibujo -H "Authorization: Bearer $TOKEN" # Dibujos de laura
```

Pegá el token en [jwt.io](https://jwt.io): el payload se lee sin la clave. Con la clave del `.env` dice "firma verificada".

## Qué mirar

- **`auth.service.ts`**: `Date.now()` está en milisegundos y los claims van en segundos. Por eso se divide por 1000 (el error que apareció en vivo, con el año 58773). `Math.floor` evita el decimal.
- **`token.guard.ts`**: `jwt.verify` y no `jwt.decode`. `decode` sólo lee el base64; `verify` recalcula la firma y controla `exp` e `iss`. Si algo falla, lanza, y el `catch` responde 401.
- **La clave se lee dentro de las funciones**, no en una constante arriba del archivo. Ver la tabla.
- **`@Res({ passthrough: true })`** en el login: setea la cookie y sigue devolviendo con `return`. Leer la cookie en el guard quedó para la clase 15 (falta `cookie-parser`).
- **El usuario que deja el guard** llega a `findAll` con `@Body('user')`. Ojo en un `POST` con DTO: los pipes corren después del guard, y `whitelist` borraría `user` si el DTO no lo declara.

## Diferencias con el código de la cátedra

| Acá | En la cátedra | Por qué |
| --- | ------------- | ------- |
| `process.env.CONTRASENA_DEL_SERVER` leído en cada llamada | `const CONTRASEÑA_DEL_SERVER = process.env... \|\| 'ASIGNAR CONTRASEÑA'` arriba del archivo | Probado: esa constante se evalúa al importar, antes de que `ConfigModule.forRoot()` cargue el `.env`. Siempre queda el valor por defecto |
| `UnauthorizedException` (401) | `return false` y `ForbiddenException` (403) | La consigna del TP 2 pide 401 |
| `exp` a 15 minutos | `+ 1` | En clase lo bajó a 1 segundo para mostrar el vencimiento |
| `LoginDto` con class-validator | `body: { user: string; pass: string }` | El profe dijo que debería ser un DTO y lo salteó para ir al punto |
| `CONTRASENA` sin ñ | `CONTRASEÑA` | Con ñ, `export CONTRASEÑA=...` falla en bash: no es un nombre de variable válido |
| Sin `console.log(req)` | Con logs de depuración | — |
| `{ token }` en el registro, sin cookie | `response.send(token)` y cookie sin opciones | El registro de clase quedó a medio hacer; la cookie segura está en el login |
