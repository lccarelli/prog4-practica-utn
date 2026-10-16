# Clase 13 — Mongoose con Nest · proyecto

El apunte de la clase está en [`../clase-apunte/apunte.md`](../clase-apunte/apunte.md).

```bash
nvm use
npm ci
npm run start:dev    # http://localhost:3000
npm test             # unitarios, sin base
npm run test:e2e     # contra el Mongo local
```

Necesita un Mongo en `localhost:27017`: el instalado (con Compass para mirar los datos) o `docker run -d -p 27017:27017 mongo:8`. Para otro servidor, por ejemplo Atlas: `MONGO_URI=mongodb+srv://... npm run start:dev`.

Hecho con `nest new` (npm, ES modules, sin observabilidad), `nest g module ubicacion` y `nest g controller|service ubicacion/ciudad` y `ubicacion/monumento`. Así quedan las dos entidades en un módulo, como en clase.

## Estructura

```
src/
├── main.ts                  ValidationPipe global con whitelist
├── app.module.ts            MongooseModule.forRoot
└── ubicacion/
    ├── ubicacion.module.ts  forFeature con los dos esquemas, dos controllers
    ├── ciudad/
    │   ├── entities/ciudad.entity.ts     @Schema, @Prop, monumentos: ObjectId[]
    │   ├── dto/                          Coords anidado con @ValidateNested
    │   └── ciudad.service.ts             CRUD con el modelo inyectado
    └── monumento/
        ├── entities/monumento.entity.ts  ciudad: ObjectId con ref
        ├── dto/                          ciudadId con @IsMongoId
        └── monumento.service.ts          crea y borra manteniendo los dos lados
test/ubicacion.e2e-spec.ts   el recorrido completo contra la base
```

## Probarlo

```bash
curl -X POST localhost:3000/ciudad -H 'Content-Type: application/json' \
  -d '{"nombre":"Avellaneda","provincia":"Buenos Aires","coords":{"lat":-34.66,"lon":-58.36}}'
# copiar el _id que devuelve
curl -X POST localhost:3000/monumento -H 'Content-Type: application/json' \
  -d '{"nombre":"Puente","ciudadId":"<_id>"}'
curl localhost:3000/ciudad/<_id>     # monumentos: ["..."]
```

## Qué mirar

- **`monumento.service.ts` → `create`**: busca la ciudad, corta si no existe, hace `push` del `_id` y guarda los dos. Es la alternativa "a mano" a la transacción que falló en clase.
- **`remove`**: lo que quedó de tarea. Saca el id del array de la ciudad con `filter` y guarda.
- **`update`** con `{ returnDocument: 'after' }`: sin esa opción, el PATCH devuelve el documento como estaba antes.
- **`monumento.service.spec.ts`**: reemplaza los modelos con `getModelToken`, así el test no necesita base.

## Diferencias con el código de la cátedra

| Acá | En la cátedra | Por qué |
| --- | ------------- | ------- |
| `CreateMonumentoDto` con validaciones | Sin decoradores | Con `whitelist: true` se borraban `nombre` y `ciudadId`: llegaba vacío |
| `@IsMongoId()` en `ciudadId` | — | Si no, un id mal formado rompe en `findById` con un 500. No se dio; es uno más de class-validator |
| `throw new NotFoundException` | `return { mensaje: 'error' }` (con 200) | Las excepciones de Nest aparecen en la clase 14 |
| `await ciudad.save()` y un solo `monumento.save()` | `ciudad?.save()` sin `await`, y el monumento se guarda dos veces | Sin `await`, la respuesta puede llegar antes de que se guarde la ciudad |
| `remove` actualiza la ciudad | Quedó de tarea | Mantener los dos lados sincronizados |
| `UpdateMonumentoDto` con `PickType` sólo de `nombre` | `PartialType` | Cambiar de ciudad obligaría a actualizar dos ciudades |
| `returnDocument: 'after'` | Sin opción | Lo explicó el profe; no quedó en el código |
| URI desde `process.env.MONGO_URI`, con la de clase por defecto | URI fija | Mismo patrón que `PORT`; hace falta para Atlas en el TP 2 |
| Colecciones `ciudades` y `monumentos` | `Ciudades` y `Monumentos` | Minúscula, como las crea Mongoose |
| Sin transacciones | Comentadas | Necesitan un replica set (ver el apunte) |
