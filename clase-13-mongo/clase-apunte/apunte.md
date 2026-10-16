# Clase 13 — Mongoose con Nest

**Fecha:** 15/10/2026 (video subido 16/10/2026) · **Mongoose** + `@nestjs/mongoose`

Video: *"Clase 13 - Mongoose"*, partes 1 y 2. Código del profesor: `clase-13-mongo/` (en el repo figura como "Clase 12: ..." en los commits).

## Qué se dio

- Cómo conectar Nest a MongoDB con Mongoose
- Esquema → módulo → modelo inyectado en el service
- Un CRUD completo de `Ciudad` contra la base
- Repaso de DTOs y validaciones de la clase 12
- Segunda entidad (`Monumento`), dos controllers en un módulo, orden de carpetas
- Referencias entre documentos (`ObjectId`) y por qué se guardan de ambos lados
- Transacciones (mostradas, no funcionan en local)

Aclaración del profesor: **el diseño de la base no se evalúa** en esta cursada (es de Bases de Datos). Mientras funcione y las cosas se guarden y se traigan, está bien; igual conviene aplicar lo aprendido allá.

---

## 1. Qué paquetes y por qué dos

```bash
npm i @nestjs/mongoose mongoose
```

Patrón de Nest: el **paquete original** (`mongoose`) más una **capa que lo adapta** (`@nestjs/mongoose`). Pasará con otros paquetes de la cursada. Los paquetes siempre se instalan **por proyecto**, nunca globales; sólo las herramientas externas (CLI, prettier) van globales.

## 2. Conectar

En `AppModule`, una sola vez:

```typescript
imports: [
  MongooseModule.forRoot('mongodb://localhost:27017/programacion4'),
],
```

- Si la URI está mal, el server **no arranca**: se queda colgado y tira `MongooseServerSelectionError` por timeout.
- La base y las colecciones se crean recién cuando se guarda el primer documento.
- Funciona con Mongo local (Compass) o con el cluster gratuito de la nube.

## 3. Esquema (la plantilla)

La entidad es una clase con decoradores:

```typescript
@Schema()
export class Ciudad {
  @Prop() nombre: string;
  @Prop() provincia: string;
  @Prop() coordenadas: { x: number; y: number };
}

export const CiudadSchema = SchemaFactory.createForClass(Ciudad);
```

- `@Schema()` convierte la clase en una plantilla de Mongo; `@Prop()` marca **qué se guarda**. Sin `@Prop`, el atributo es sólo de código.
- Se usan **clases y no interfaces** porque los decoradores necesitan una clase.
- `SchemaFactory.createForClass` genera el esquema que se registra.
- Los objetos anidados andan sin subesquema; por prolijidad se suelen definir como subesquema aparte.
- Opciones útiles dentro de `@Prop`: `required`, `min`/`max`, `enum`, `default`, `type`.
- El nombre de la colección sale solo: nombre de la clase + `s`. Con "Ciudad" queda `ciudads`; se corrige con `@Schema({ collection: 'ciudades' })`.

Tres tipos de cosa distintos, todos parecidos:

| | Qué es |
| --- | --- |
| **Esquema** | La plantilla: campos, índices, validaciones de la base |
| **Modelo** | Lo que te da los métodos (`save`, `find`...) |
| **Documento** | Una instancia guardada |

## 4. Registrar y usar el modelo

Tres pasos encadenados, en este orden:

**a) En el módulo de la feature:**

```typescript
imports: [
  MongooseModule.forFeature([{ name: Ciudad.name, schema: CiudadSchema }]),
],
```

`Ciudad.name` devuelve el string `'Ciudad'`; es más seguro que escribirlo a mano.

**b) En el service, inyectar el modelo por constructor:**

```typescript
constructor(@InjectModel(Ciudad.name) private ciudadModel: Model<Ciudad>) {}
```

El nombre del `@InjectModel` tiene que **coincidir** con el de `forFeature`.

**c) Usarlo:**

```typescript
async create(dto: CreateCiudadDto) {
  const ciudad = new this.ciudadModel(dto);
  return await ciudad.save();
}
findAll()            { return this.ciudadModel.find(); }
findOne(id: string)  { return this.ciudadModel.findById(id); }
update(id, dto)      { return this.ciudadModel.findByIdAndUpdate(id, dto); }
remove(id: string)   { return this.ciudadModel.findByIdAndDelete(id); }
```

- Todo es **asincrónico**: sin `await` o sin devolver la promesa llega vacío.
- **`findByIdAndUpdate` devuelve el documento anterior** al cambio. Para recibir el nuevo hay que pedirlo con la opción de la versión nueva (en Mongoose 9: `{ returnDocument: 'after' }`).
- Cada documento trae `_id` (ObjectId, generado por Mongoose en el servidor, no por la base) y `__v` (versión).
- Los IDs de la URL llegan como string. Ya no hace falta el `+id` de la clase 12.
- El service **no guarda estado** en variables: una API REST no tiene estado; el estado vive en la base. Es lo opuesto a los servicios de Angular que usábamos como máquinas de estado.

## 5. Servicios y providers

- Un servicio es un **provider inyectable**; el modelo es otro provider.
- Es **singleton**, igual que en Angular: una sola instancia, creada al primer uso.
- Para inyectar algo en otro módulo hay que **exportarlo** desde el módulo que lo provee (`exports`).
- Cada controller, service o modelo sólo se puede inyectar donde su módulo lo declara.

## 6. Más de un controller en un módulo y orden de carpetas

- Un módulo puede tener varios controllers (cada uno con su prefijo) si las entidades están muy relacionadas.
- Si las carpetas se desordenan (controllers y services mezclados), es señal de que hay que reorganizar **ya**: ordenar por **módulo/feature** (agrupación lógica) y no por tipo de archivo. Se puede refactorizar sin miedo; sólo cambian imports.
- Cuando se mueve algo a mano, se actualizan referencias y nombres del módulo.

## 7. Relaciones entre documentos

```typescript
// Monumento
@Prop({ type: Types.ObjectId, ref: 'Ciudad', required: true })
ciudad: Types.ObjectId;

// Ciudad
@Prop({ type: [{ type: Types.ObjectId, ref: 'Monumento' }] })
monumentos: Types.ObjectId[];
```

- Se guarda sólo el **`ObjectId`** del otro documento, no el documento entero.
- Si el id llega como string, hay que convertirlo antes de guardar para que quede como `ObjectId` y no como string.
- `Types` se importa de `mongoose`.

**¿De qué lado se guarda?** En SQL se guarda del lado "muchos". En Mongo se prioriza la **lectura rápida**: guardar de ambos lados cuesta dos escrituras pero cada lectura es una sola. El profesor eligió **guardar ambos** (el monumento apunta a la ciudad y la ciudad lista sus monumentos).

Consecuencia: al crear un monumento hay que **actualizar la ciudad** también. Hay que chequear que la ciudad exista, hacer `push` del id y guardar ambos. Y al borrar o modificar, mantenerlos sincronizados (lo dejó como tarea).

## 8. Transacciones (sólo mencionadas)

```typescript
constructor(@InjectConnection() private connection: Connection) {}

const session = await this.connection.startSession();
session.startTransaction();
// ... operaciones con .session(session) ...
await session.commitTransaction();     // si falla algo: abortTransaction()
```

- Sirven para que varios cambios se hagan **todos o ninguno**.
- En clase **falló**: el Mongo local no tenía activado el *replica set* y las transacciones lo exigen. No lo activó.
- El profesor aclaró que **probablemente no se pida en el TP**. Alternativa: hacerlo a mano (buscar la ciudad, si no existe cortar, si existe modificar y guardar).
- Dato: el import de `Connection` viene de `mongoose` (`import mongoose from 'mongoose'` y usar `mongoose.Connection`), no de `@nestjs/mongoose`.

## 9. Validación: dos capas, cada una con su trabajo

| Capa | Dónde | Qué protege |
| ---- | ----- | ----------- |
| DTO + `ValidationPipe` | Entrada del request | Lo que manda el cliente |
| Esquema (`required`, `enum`, `min`...) | Base | Una red extra por si algo se cuela |

El profesor recomienda validar en el DTO y **no volver a validar** el mismo dato en la base.

---

## Cosas que confunden

| Síntoma | Causa |
| ------- | ----- |
| El server no arranca y no dice qué | URI de Mongo incorrecta: espera el timeout |
| `Nest can't resolve dependencies of CiudadService` | Falta `MongooseModule.forFeature` en el módulo, o el nombre no coincide con `@InjectModel` |
| El `find` devuelve una promesa o `{}` | Falta `await` o `return` |
| El PATCH devuelve el dato viejo | `findByIdAndUpdate` devuelve por defecto el anterior |
| La colección se llama `ciudads` | Pluralización automática: usar `@Schema({ collection })` |
| `ciudad.monumentos` no se puede leer | Falta el `await` del `findById` |
| El `ObjectId` queda como string en la base | No se convirtió con `Types.ObjectId` antes de guardar |
| `Transaction numbers are only allowed on a replica set member` | Mongo local sin replica set |

## Referencia rápida

```typescript
// módulo
MongooseModule.forFeature([{ name: X.name, schema: XSchema }])
// service
@InjectModel(X.name) private xModel: Model<X>
// operaciones
new this.xModel(dto).save()        this.xModel.find()
this.xModel.findById(id)           this.xModel.findByIdAndUpdate(id, dto)
this.xModel.findByIdAndDelete(id)
```

## Para el TP 2

- `MongooseModule.forRoot` en `AppModule`, con la URI en variable de entorno (Atlas para el deploy).
- Colecciones: `usuarios`, `publicaciones`, `comentarios`, y la de me gusta. Referencias con `ObjectId`.
- **No se dio** `populate`, agregaciones (`$group`, `$match`), índices únicos ni paginación (`skip`/`limit`/`sort`): hay que anunciarlas antes de usarlas.
- Para que un id mal formado no termine en un 500, el proyecto valida `ciudadId` con `@IsMongoId()` (de class-validator, no se nombró en clase).

## Links

- [Nest — MongoDB](https://docs.nestjs.com/techniques/mongodb)
- [Mongoose — Schemas](https://mongoosejs.com/docs/guide.html)
- [Mongoose — Queries](https://mongoosejs.com/docs/queries.html)
- [Mongoose — Transactions](https://mongoosejs.com/docs/transactions.html)
