# Clase 16 — Storage externo, interceptors, health y logger

**Fecha:** 29/10/2026 · **Paquetes:** `cloudinary`, `@nestjs/terminus`, `@nestjs/axios`

Video: *"Storage externo, interceptors, health, logger"*, partes 1 y 2. En YouTube figura como "Clase 01", por error. Código del profesor: `clase-16-storage-externo/` (parte 1) y `clsae-16-temas-varios/` (parte 2, con el typo en el nombre).

## Qué se dio

- Por qué los archivos van a un storage externo y no a la base ni al servidor
- Subir una imagen desde Nest a **Cloudinary** con `FileInterceptor`
- Interceptors en Nest
- Health checks con **Terminus**, y su uso en Render
- El logger de Nest

> "Hoy fue la última clase realmente obligatoria para el trabajo práctico."

---

## 1. Storage externo

En el TP 1 se usó Supabase Storage. Desde un backend, Supabase "es rebuscado y da problemas", y "en este TP siempre optamos por ir un paso más allá". Se usa **Cloudinary**, que tiene plan gratis. Trae herramientas para recortar o cambiar la calidad que no se usan: sólo guardar y obtener la URL.

La idea es la de siempre: el archivo va a una carpeta (bucket) y el proveedor da una **URL** pública. El más conocido es **Amazon S3**. Todos guardan, dan una URL, permiten configurar seguridad y replican en una CDN. Con otro proveedor "la idea no varía en nada".

### ¿Por qué no en Mongo o en el propio servidor?

Lo preguntaron en clase.

- **En la base van datos, no archivos.** En Mongo se guarda **la URL** que devuelve Cloudinary.
- **En el servidor**, como en Programación III con `public/`, sirve para algo chico, pero en producción se separa:
  - El servidor tiene CPU, RAM y disco para procesar. Un millón de archivos obligan a escalar el disco sin necesitar más CPU.
  - Cada archivo que devuelve es cómputo que le saca a la API.
  - El disco del server es para el código y los temporales: "nunca vas a tener 100 GB de imágenes junto a tu servidor".

> "En Programación IV siempre tratamos de que lo que suban esté con un pie en la realidad, un pie y medio."

El archivo llega a Nest y Nest lo reenvía a Cloudinary: por nuestro servidor "simplemente pasa".

### La cuenta de Cloudinary

- Se entra con Google o GitHub.
- En *Settings* → **API Keys** están la **API Key** y la **API Secret**. Si no hay, se genera una; Cloudinary manda un mail para confirmar.
- El **cloud name** figura arriba, en la misma sección.
- El plan gratis es "bastante generoso", más o menos 1 GB. "Si se pasan hacen otra cuenta y cambian las variables de ambiente."

Las variables van con un **prefijo que las agrupe**, así quedan juntas al ordenarlas: `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_CLOUD_NAME`. "Nombren las cosas bien, ordénense y todo sale mejor."

## 2. Recibir el archivo: `FileInterceptor`

Nest ya trae la capa que en Express era **Multer**: el middleware que lee un body `multipart/form-data`. Deja los textos en `req.body` y los archivos en `req.file` o `req.files`. En JSON no se puede mandar un archivo; form-data está pensado para eso.

```typescript
@Post()
@UseInterceptors(
  FileInterceptor('imagen', { limits: { fileSize: 1024 * 1024 * 2 } }),   // 2 MB
)
async subirImagen(@UploadedFile() archivo: Express.Multer.File) {
  return this.appService.subirArchivo(archivo);
}
```

- `'imagen'` es la clave del form-data. En Postman: *Body* → *form-data*, tipo *File*.
- `@UploadedFile()` es como `@Body()`, pero para el archivo.
- `FileInterceptor` viene de `@nestjs/platform-express`. "No hizo falta hacer nada en el app module."
- Con `limits.fileSize`, Nest lo bloquea antes de mandarlo a Cloudinary. Lo probó con una imagen 4K de unos 4 MB.
- La validación del tipo de archivo la nombró; no la hizo.
- Primero intentó con `@nestjs/storage` y `StorageModule.forRoot({})`. Pedía configurar `disks` y lo dejó a medias.

### El tipo `Express.Multer.File`

No es el `File` de JavaScript, y por eso los primeros intentos fallaron. Es el objeto de Multer, con `buffer`, `mimetype`, `originalname` y `size`. Para tener el tipo instaló `multer` y `@types/multer`, "solamente para que el ejemplo quede más lindo". Aun así no lo reconocía hasta que puso `import { Multer } from 'multer'` en `main.ts`. Lo atribuyó a un bug de TypeScript.

**Por qué pasa:** el `tsconfig.json` que genera Nest 12 trae `"types": ["vitest/globals", "node"]`. Esa lista deja afuera los tipos globales de cualquier otro `@types` hasta que algún archivo los importa. Se resuelve agregando `"multer"` a la lista o con el import del profe.

## 3. Mandarlo a Cloudinary

El cuatrimestre pasado usaron `multer-storage-cloudinary`. Lo dejó porque su última versión es de hace **6 años**: "no me gusta usar cosas que no se actualizan". Ahora usa el paquete **oficial**, que trae sus tipos:

```bash
npm i cloudinary
```

```typescript
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class AppService {
  constructor() {
    cloudinary.config({
      api_key: process.env.CLOUDINARY_API_KEY || '',
      api_secret: process.env.CLOUDINARY_API_SECRET || '',
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    });
  }

  async subirArchivo(file: Express.Multer.File) {
    const base64 = file.buffer.toString('base64');
    const uri = `data:${file.mimetype};base64,${base64}`;

    const resultado = await cloudinary.uploader.upload(uri, {
      folder: 'clase-16',
      public_id: `${Date.now()}-clase`,   // sin extensión: la agrega Cloudinary
    });
    return resultado.url;
  }
}
```

- La lógica va al **service**; el controller sólo define la ruta y qué recibe.
- `config` va en el **constructor**, que corre una sola vez, y no en cada petición.
- `|| ''` está "solamente por TypeScript".

### Los errores en vivo, en orden

La clase estaba armada para mostrar errores: "mostrar cuando no funciona es la vida real". La documentación del paquete le pareció pésima.

1. Sin `config`, esperando que tomara sola la `CLOUDINARY_URL`: *split is not a function*. En realidad le estaba mandando un `File` de JavaScript.
2. Con `file.arrayBuffer()`, `file.stream()`... siguió fallando. El tipo estaba mal (sección 2).
3. **`upload_stream`** no hacía nada: el callback nunca corría. Faltaba cerrar el stream con `.end(buffer)`. "Cloudinary necesita que le avisen que se cierra la conexión para hacer el envío."
4. *cloud name is disabled*: buscó un rato en el panel. Con los valores escritos a mano el error cambió: **`process.env` estaba vacío**. En el repo quedó `ConfigModule.forRoot({ envFilePath: '../.env' })`, que busca el `.env` en la carpeta de arriba. En el audio no se entiende qué cambió exactamente. "Tema de Nest, no de Cloudinary."
5. *empty file*, al mandar el buffer por stream: Multer lo da "desestructurado en partes".
6. **La solución:** pasarlo a texto como **data URI** (`data:image/png;base64,...`) y usar `uploader.upload`, que acepta una URL, una ruta o una URI y devuelve una promesa. Mostró que esa URI pegada en el navegador muestra la imagen.
7. El primer `public_id` llevaba la extensión y quedó `.png.png`.

Lo que faltó: guardar la URL en la base.

## 4. Interceptors

> "Los interceptors de Nest funcionan exactamente igual que los de Angular."

Están entre el cliente y el método. Pueden:
- correr código antes y después del método;
- transformar el resultado o la excepción;
- responder sin llegar al método.

Ejemplos que ya vimos: `FileInterceptor` y el `CacheInterceptor` de la clase 15.

```bash
nest g interceptor interceptors/ejemplo
```

```typescript
@Injectable()
export class EjemploInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request: Request = context.switchToHttp().getRequest();
    // antes del método
    return next.handle().pipe(
      tap(() => {
        // después del método
      }),
    );
  }
}
```

- El `context` es el mismo `ExecutionContext` de los guards. `getRequest()` da la request y `getResponse()`, la response.
- A diferencia de Angular, no se pasa una request clonada: si la modificás, cambia para todo lo que sigue.
- Se aplica como un guard: `@UseInterceptors(...)` en un controller o en una ruta, o de forma global.
- **Errores en vivo:**
  - `request.body` es `undefined` en un GET; lo resolvió con spread.
  - Setear headers o cambiar el status de la response dentro del `tap` no funcionó. "Si queremos modificar la response tenemos que usar el `map`." No lo implementó.
- **¿Guard o interceptor?** El guard sólo decide si pasa o no, y es para seguridad. El interceptor corre cosas antes y después y casi siempre deja seguir.

"Esto es por cumplir. Si quieren hacer algo con esto, es cuestión de ustedes idear la lógica."

## 5. Health checks

### Contexto: DevOps

Desarrollo es pensar, codear, compilar y testear; operaciones es pasar a producción. "Nuestra parte de ops es bastante pobre": push y que Vercel o Render deployen. Lo de que anda en local y no en el deploy es justamente un problema de ops.

Un **health check** es un endpoint que responde si el servidor está bien: "ultra básico, 200 o 500". Algo lo consulta cada tanto y, si falla, dispara alarmas: mandar un mail, reiniciar, pasar a una réplica, levantar más instancias. Las páginas de estado (las de GitHub o Claude) "no son más que un health check constante". El health check puede ser público; los logs, nunca.

### Terminus

```bash
npm i @nestjs/terminus @nestjs/axios     # axios lo pide el ping HTTP
nest g module health
nest g controller health
```

```typescript
// health.module.ts
imports: [TerminusModule, HttpModule],

// health.controller.ts
@Get()
@HealthCheck()
check() {
  return this.health.check([
    () => this.http.pingCheck('google', 'https://google.com'),
    () => this.disk.checkStorage('disco-porcentaje', { path: '/', thresholdPercent: 0.95 }),
    () => this.disk.checkStorage('disco-espacio', { path: '/', threshold: 1700 * 1024 ** 3 }),
    () => this.memory.checkHeap('memory_heap', 30 * 1024 * 1024),
    () => this.mongo.pingCheck('mongo', ...),
  ]);
}
```

| Chequeo | Qué mira | Lo que pasó en clase |
| ------- | -------- | -------------------- |
| `http.pingCheck` | Que el server tenga internet y DNS | Falló al arrancar: faltaba `@nestjs/axios` |
| `disk.checkStorage` con `thresholdPercent` | Porcentaje del disco ocupado | Con 0.5 falló porque su disco estaba más lleno; lo subió a 0.95 |
| `disk.checkStorage` con `threshold` | El **máximo** ocupado, en bytes | Primero lo leyó como "mínimo libre" y se corrigió |
| `memory.checkHeap` | La memoria del **proceso** de Node, no la RAM de la compu | Con 30 MB fallaba de a ratos |
| `mongo.pingCheck` | La conexión a Mongo | Le pasó una URI inválida a propósito |

- Si todo da `up`, responde 200 con el detalle. Si algo falla, responde **503** con cuál falló.
- Los umbrales salen de los requisitos de cada sistema; se pueden definir con pruebas de estrés.

### En Render

En *Settings* → **Health Check Path**: `/health`. Render consulta esa ruta antes de dar por levantado el deploy. Si falla, reintenta cada ~10 segundos y mantiene el deploy anterior. En la demo, el de Mongo fallaba a propósito y el deploy nunca terminó.

Lo mismo se extiende a CI/CD: tests, linter y chequeos que tienen que pasar antes de deployar. Puso de ejemplo una red social que empieza a guardar imágenes en los posteos: si un cambio rompe la estructura, un test lo frena.

## 6. Logger

> Cuando un cliente llama gritando que no anda, "tu única fuente fiable son los logs".

- Nest ya trae un logger: es el que imprime los mensajes de colores al arrancar.
- Qué loguear: los verbos, las acciones importantes (se borró algo) y las validaciones.

**Global**, en `main.ts`:

```typescript
const app = await NestFactory.create(AppModule, {
  logger: new ConsoleLogger({ colors: true, prefix: 'EJEMPLO', timestamp: true }),
});
```

Se puede elegir qué niveles mostrar, los colores, el prefijo (en lugar de "Nest"), el timestamp o salida en JSON.

**Por clase**, en lugar de `console.log`:

```typescript
logger = new Logger('ejemploInterceptor');      // el contexto, para filtrar con Ctrl+F
this.logger.log('Antes del verbo');
```

No se inyecta por constructor: primero lo intentó así y no era. Muestra el contexto y el `+ms` desde el log anterior, útil para medir tiempos.

**Con mesura:**
- En su trabajo apagaron los `log.info` porque la factura de AWS por logs fue muy alta.
- En el **front**, en producción se apagan los logs que no sean errores. El usuario no tiene por qué verlos.
- "Cuando a la IA le tengas que decir que se rompió algo, va a leer los logs. Si encuentra logs, encuentra el error más fácil."

---

## Cosas que confunden

| Síntoma | Causa |
| ------- | ----- |
| `Namespace 'Express' has no exported member 'Multer'` | Falta `@types/multer`, o `"multer"` en `types` del tsconfig |
| *split is not a function* al subir | Se está mandando un `File` de JS, no el `Express.Multer.File` |
| `upload_stream` no hace nada | Falta `.end(buffer)` |
| *cloud name is disabled* | Las variables de Cloudinary están vacías: revisar dónde está el `.env` |
| *empty file* | Mandar el buffer suelto; usar data URI con `upload` |
| La imagen queda `.png.png` | El `public_id` no lleva extensión |
| Sin archivo, el endpoint da 500 | No se chequea que `archivo` exista |
| El health check falla al arrancar | Falta `@nestjs/axios` para el ping HTTP |
| `checkHeap` falla de a ratos | Umbral muy bajo: es la memoria del proceso |
| `/health` da disco `down` en una Mac | `/` es el volumen del sistema; medir `process.cwd()` |
| Render no termina de deployar | El health check no responde 200 |
| Cambiar headers en el `tap` no hace nada | Para modificar la respuesta va `map` |

## Para el TP 2

- **Subir archivos** a un storage externo es "lo más directamente utilizable en el TP". En Mongo va la URL.
- Interceptors, health y logger, igual que lo de la clase 15, **no son obligatorios**. "Suman, no mucho, pero suman."
- **Desde esta clase no hay más temas del TP.** Lo que sigue son temas extra: "no hay donde meterlos, no hay que meterlos con calzador".
- *Task scheduling* quedó para otro día.

## Links

- [Cloudinary — Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Cloudinary — Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
- [Nest — File upload](https://docs.nestjs.com/techniques/file-upload)
- [Nest — Interceptors](https://docs.nestjs.com/interceptors)
- [Nest — Health checks (Terminus)](https://docs.nestjs.com/recipes/terminus)
- [Nest — Logger](https://docs.nestjs.com/techniques/logger)
- [Render — Health checks](https://render.com/docs/health-checks)
