# Clase 07 — Supabase Storage · proyecto

El apunte de la clase está en [`../clase-apunte/apunte.md`](../clase-apunte/apunte.md).

```bash
nvm use
npm ci
npm start        # http://localhost:4200
```

Antes de levantarlo, ejecutar [`../clase-apunte/storage.sql`](../clase-apunte/storage.sql) en el **SQL Editor** de Supabase. Crea el bucket público `imagenes` (3 MB por archivo, sólo imágenes), sus políticas y la tabla `imagenes`, donde se guarda la ruta de cada archivo. El bucket también se puede crear a mano desde *Storage → New bucket*, como en clase.

Creado con `ng new` y `ng generate`. El registro con foto de perfil que hizo el profe es un repaso de la clase 05 y no está acá.

## Estructura

```
src/app/
├── interfaces/imagen.ts       id, created_at y ruta
├── services/
│   ├── supabase.ts            Crea el cliente
│   ├── storage.ts             subir, urlPublica y eliminar en el bucket
│   └── db.ts                  La tabla con las rutas
└── galeria/                   Input file, subir, listar y eliminar
```

## Qué mirar

- **`galeria.ts`, `cargarImagen()`**: el `File` se saca del evento `input`, no del `FormControl`; el control lo recibe con `setValue`.
- **`storage.ts`, `subir()`**: el nombre lo pone quien sube: `galeria/` + `Date.now()` + la extensión sacada del MIME type. Devuelve la **ruta**, no la URL.
- **`db.ts`**: en la tabla se guarda la ruta. La URL se arma cada vez con `getPublicUrl`.
- **`subir()` en la galería**: primero el archivo, después la fila. Si falla el insert, la imagen queda huérfana en el bucket (ver el punto 5 del apunte).
- **`accept="image/*"`** sólo filtra el diálogo para elegir el archivo. La validación de verdad es la del bucket: tamaño y MIME type.
