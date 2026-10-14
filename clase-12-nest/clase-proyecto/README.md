# Clase 12 — NestJS · proyecto

El apunte de la clase está en [`../clase-apunte/apunte.md`](../clase-apunte/apunte.md).

```bash
nvm use
npm ci
npm run start:dev    # http://localhost:3000, reinicia al guardar
npm test             # unitarios
npm run test:e2e     # las validaciones, con requests reales
```

Hecho con `nest new` (npm, ES modules, sin observabilidad) y `nest g resource usuarios` (REST API). No guarda nada todavía: la base llega en la clase 13.

## Estructura

```
src/
├── main.ts                       ValidationPipe global con whitelist
├── app.module.ts                 importa UsuariosModule
├── app.controller.ts             /app: decoradores de método, @Query, @Param, @HttpCode
└── usuarios/
    ├── usuarios.controller.ts    CRUD generado por el CLI
    ├── usuarios.service.ts       devuelve lo que recibe
    ├── entities/usuario.entity.ts   cómo se guarda (con _id y fechas)
    └── dto/
        ├── create-usuario.dto.ts    validaciones, Direccion anidada
        └── update-usuario.dto.ts    OmitType: sin mail ni contraseña
test/app.e2e-spec.ts              un caso por validación
```

## Probarlo

```bash
curl "localhost:3000/app?page=2"
curl -X PUT localhost:3000/app/7

curl -X POST localhost:3000/usuarios -H 'Content-Type: application/json' -d '{
  "nombre": "Laura", "apellido": "Perez", "contraseña": "Secreta123",
  "roles": ["usuario"], "direccion": { "calle": "Mitre", "numero": 750 },
  "mail": "laura@mail.com", "esAdmin": true
}'
```

El último devuelve el usuario **sin** `esAdmin`: lo borró `whitelist`. Cambiá el mail por `"x"` o el número por `0` y vuelve un 400 con el campo que falló.

## Qué mirar

- **`create-usuario.dto.ts`**: `Direccion` está declarada antes que `CreateUsuarioDto` y `@ValidateNested` va con `@Type(() => Direccion)`. Sin alguna de las dos, no valida o no arranca (ver "Cosas que confunden" en el apunte).
- **`update-usuario.dto.ts`**: las tres variantes de la clase. Quedó `OmitType`, como en la cátedra, así que el PATCH exige los campos que quedan.
- **`main.ts` y el e2e**: el test arma su propia app, así que tiene que volver a agregar el `ValidationPipe`.

## Diferencias con el código de la cátedra

| Acá | En la cátedra | Por qué |
| --- | ------------- | ------- |
| `contraseña` con `@Matches` (8, una mayúscula, un número) | `@MinLength(6)` y `@MaxLength(30)` | Es la regla del TP 2; `@Matches` se nombró en clase |
| `POST /app` con `@HttpCode(201)` | `@HttpCode(204)` | Con 204 el JSON de respuesta no llega |
| Tests e2e de las validaciones | Los que genera el CLI | Testing no se dio; el profe dijo que lo da al final |
