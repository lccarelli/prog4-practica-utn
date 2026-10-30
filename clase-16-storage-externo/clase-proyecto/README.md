# Clase 16 — Storage externo, interceptors, health y logger · proyectos

El apunte de la clase está en [`../clase-apunte/apunte.md`](../clase-apunte/apunte.md).

Dos proyectos, como en la cátedra:

| Carpeta | Qué es | Hecho con |
| ------- | ------ | --------- |
| `storage/` | `POST /` con un archivo `imagen` → Cloudinary → devuelve la URL | `nest new`, `npm i cloudinary @nestjs/config`, `npm i -D @types/multer` |
| `varios/` | Interceptor con `Logger`, `GET /health` con Terminus y `ConsoleLogger` | `nest new`, `nest g interceptor interceptors/logging`, `nest g module\|controller health`, `npm i @nestjs/terminus @nestjs/axios` |

## Correrlo

```bash
cd storage
nvm use && npm ci
cp .env.example .env      # las tres CLOUDINARY_* de Settings → API Keys
npm run start:dev
npm test && npm run test:e2e    # Cloudinary simulado: no hace falta cuenta

cd ../varios
npm ci && npm run start:dev
curl localhost:3000/health
npm test && npm run test:e2e
```

Subir una imagen con Postman: `POST localhost:3000`, *Body* → *form-data*, clave `imagen` de tipo *File*. O con curl:

```bash
curl -F "imagen=@foto.png" localhost:3000
# {"url":"https://res.cloudinary.com/<cloud_name>/image/upload/.../clase-16/1730000000000-clase.png"}
```

## Estructura y qué mirar

```
storage/
├── tsconfig.json          "types": [..., "multer"]
└── src/
    ├── app.controller.ts  FileInterceptor('imagen', { limits }) y @UploadedFile()
    └── app.service.ts     config en el constructor, data URI, uploader.upload
varios/src/
├── main.ts                                ConsoleLogger con prefix y timestamp
├── interceptors/logging/logging.interceptor.ts   antes de next.handle() y después con tap
└── health/                                TerminusModule + HttpModule, @HealthCheck()
```

- **`Express.Multer.File`**: Nest 12 genera el `tsconfig` con `"types": ["vitest/globals", "node"]`. Eso deja afuera los tipos globales de `@types/multer` hasta que algún archivo importa `multer`. Es lo que en clase pareció un bug de TypeScript y se resolvió con `import { Multer } from 'multer'` en el `main.ts`. Acá se agrega `"multer"` a `types`.
- **`app.service.ts`**: el buffer suelto le llegaba vacío a Cloudinary ("empty file"). Se manda como `data:<mimetype>;base64,...` con `uploader.upload`, que devuelve una promesa. El `public_id` va sin extensión, porque Cloudinary la agrega (en vivo quedó `.png.png`).
- **El límite de 2 MB** lo aplica Multer antes de llegar al service: responde 413 y no se llama a Cloudinary. El e2e lo prueba.
- **`health.controller.ts`**: el disco se mide en `process.cwd()`. En macOS, `/` es el volumen del sistema y siempre figura casi lleno. Si `/health` da `disco: down` en tu máquina, revisá el espacio libre: en esta compu el volumen de datos está al 100%.
- **El e2e de `varios`** simula el ping y el disco, que dependen de internet y de la máquina, y prueba el 200 y el 503.

## Deploy en Render

- **`storage`**: igual que el server de la clase 15 (Web Service, `npm install && npm run build`, `npm run start:prod`), con las tres `CLOUDINARY_*` en *Environment*.
- **`varios`**: *Settings* → *Health Check Path* = `/health`. Render no da por levantado el deploy hasta que esa ruta responda 200; mientras tanto deja el anterior.

## Diferencias con el código de la cátedra

| Acá | En la cátedra | Por qué |
| --- | ------------- | ------- |
| Sin `@nestjs/storage` ni `StorageModule` | Importado y sin usar | `FileInterceptor` viene de `@nestjs/platform-express`; el intento con `StorageModule` quedó a medias |
| `"multer"` en `types` del tsconfig | `import { Multer } from 'multer'` en `main.ts` | El mismo problema, sin un import que no se usa |
| `ConfigModule.forRoot()` | `forRoot({ envFilePath: '../.env' })` | El `.env` va en la carpeta del proyecto, junto al `.env.example` |
| `BadRequestException` si falta el archivo o no es imagen | Sin chequeo: sin archivo da 500 | El profe nombró la validación del mimetype y no la hizo |
| Devuelve `{ url: secure_url }` | `.url` como texto | La URL con https, y siempre JSON (clase 15) |
| Sin `console.log(base64)` | Quedó | Él mismo dijo que había que borrarlo |
| Interceptor que mide el tiempo | Interceptor que modifica `request.body` y no usa la response | Lo que se puede hacer con `tap`. Modificar la respuesta pide `map`, que no se mostró |
| Health sin chequeo de Mongo | `pingCheck('mongo', { connection: 'mongodb://asdasdasdas' })` | Estaba hecho para fallar y por eso su deploy nunca pasaba el health check. Con `MongooseModule` configurado alcanza `pingCheck('mongo')` |
| Heap a 300 MB y disco al 95% | 30 MB y 1700 GB | Calibrados para su máquina; 30 MB fallaba de a ratos |
| Sin guardar la URL en una base | Quedó pendiente | En el TP 2 va en el documento de la publicación o del usuario |
