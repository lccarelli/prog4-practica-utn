# Clase 07 — Supabase Storage

**Fecha:** 08/09/2026 · **Angular:** 22.1.0 · **@supabase/supabase-js:** ^2.112.4

Video: *"Clase 07 - Supabase Storage + todo supabase"*, partes 1 y 2.

## Qué se dio

- Buckets: crear, políticas, límites de tamaño y MIME type
- Subir un archivo desde un `<input type="file">` en un Reactive Form
- Obtener la URL pública y guardarla en la base de datos
- Repaso integrado: registro con imagen de perfil + tabla de usuarios propia
  vinculada a `auth.users` + RLS de esa tabla

El ejemplo en vivo fue un **registro con foto de perfil**: subir la imagen
al bucket, guardar su URL en `user_metadata`, y además crear una tabla
`usuarios` propia (con `nombre` y `foto_portada`) enlazada por FK al `id`
de `auth.users`.

---

## 1. Crear un bucket

Storage → New bucket. Se arranca todo lo menos seguro posible y se ajusta
después:

- **Público** (por ahora)
- **Límite de tamaño** por archivo (ej. 3 MB — una imagen 4K pesa ~4 MB)
- **MIME types permitidos** (ej. `image/png` a secas para el ejemplo; en
  la práctica conviene `image/*`)

Un bucket es un contenedor de archivos y carpetas — Supabase lo llama
"supercarpeta". Dentro se pueden anidar carpetas normales.

## 2. Subir un archivo

```typescript
const ruta = `perfil/${Date.now()}.${file.type.split('/')[1]}`;
const { data, error } = await this.supabase.Supabase.storage
  .from('imagenes')
  .upload(ruta, file);
```

**El nombre de archivo lo define quien sube, no Supabase.** Por eso
conviene algo único (`Date.now()` + extensión) — con nombres fijos, dos
uploads pisan el mismo archivo. (Con `Date.now()` del lado del cliente, dos
subidas en el mismo milisegundo podrían chocar; para el ejemplo de clase
alcanza, en producción convendría un id generado server-side o un uuid.)

### El problema real: sacar el `File` de un `<input type="file">`

Un Reactive Form **no captura bien un input de tipo file** — el
`FormControl` recibe el string falso `C:\fakepath\...`, no el archivo. Hay
que interceptar el evento `input` a mano:

```typescript
cargarImagen(event: Event) {
  const elemento = event.target as HTMLInputElement;
  if (elemento.files) {
    this.formRegistro.controls.foto.setValue(elemento.files[0]);
  }
}
```

```html
<input type="file" (input)="cargarImagen($event)" accept="image/png" />
```

El control de foto se tipa como `FormControl<File | null>` para que TS no
se queje. `accept` limita qué se puede *elegir* en el diálogo del sistema,
pero no impide que alguien fuerce otro tipo — la validación real es la del
bucket (MIME type permitido) del lado del servidor.

Para permitir varios archivos: atributo `multiple` en el input, y tomar
todos los `elemento.files` en vez de sólo `files[0]`.

## 3. RLS sobre Storage

Storage también tiene políticas — mismo mecanismo que las tablas. Sin
política, el `upload` falla con "row violates row-level security policy",
no con un error de archivo. Se configuran desde Storage → Policies del
bucket, con plantillas o a mano: quién puede `select`/`insert` sobre ese
bucket.

## 4. Obtener la URL pública

```typescript
const { data } = this.supabase.Supabase.storage
  .from('imagenes')
  .getPublicUrl(ruta);
// data.publicUrl
```

Si el bucket es público, la URL es predecible:
`{SUPABASE_URL}/storage/v1/object/public/{bucket}/{ruta}` — se puede
armar a mano concatenando el `environment`, o pedírsela a `getPublicUrl`.
Si el bucket **no** fuera público, se usaría `createSignedUrl` con una
expiración, y la URL lleva un token — no es la misma forma.

**El dato que hay que guardar siempre es la `ruta`** (`perfil/xxx.png`),
no la URL completa armada — la URL se puede reconstruir en cualquier
momento a partir de la ruta más lo que ya está en `environment`, así se
ahorra espacio en cada fila.

## 5. Orden de operaciones: subir imagen antes de crear el registro

Se sube primero la imagen, se obtiene su URL, y **recién con esa URL** se
llama a `signUp` pasándola en `options.data`. Si falla la subida, no se
llega a crear la cuenta.

**Esto deja un archivo huérfano si falla el segundo paso** (se sube la
imagen pero después falla el registro). Es un problema real, reconocido en
clase: la solución de fondo es un rollback hecho desde una función de
servidor (Supabase Edge Function) que borre la imagen si el registro
falla — algo que un cliente sin backend propio no puede garantizar, porque
si el usuario cierra la pestaña a mitad de camino, ese "borrar si falla"
nunca se ejecuta. Con NestJS (más adelante en la cursada) el rollback se
hace del lado del servidor, correctamente.

## 6. Tabla de usuarios propia, enlazada a `auth.users`

En vez de acumular todo en `user_metadata`, conviene una tabla en `public`
con FK al esquema de auth:

```sql
create table usuarios (
  id uuid primary key references auth.users(id),
  nombre text,
  foto_portada text
);
```

Flujo: `signUp()` exitoso → tomar `data.user.id` → `insert` en `usuarios`
con ese mismo id. La política de esa tabla combina público para leer y
"sólo yo" para modificar:

```sql
create policy "select publico" on usuarios for select using (true);
create policy "solo el dueno modifica" on usuarios for update
  using (id = auth.uid());
```

Para mostrar los datos combinados (auth + tabla propia), el servicio de
auth hace un segundo `select` a `usuarios` con el id de la sesión y mezcla
ambos objetos (o se guarda todo en `user_metadata`, mezclando menos
prolijamente pero con un solo lugar de acceso).

---

## Cosas que confunden

| Síntoma | Causa |
| ------- | ----- |
| El upload manda un string de texto plano en vez de la imagen | El `FormControl` de un input file no captura el archivo real; hay que leerlo del evento `input` con `event.target.files[0]` |
| "row violates row-level security policy" al subir | Falta la política de `insert` en el bucket, no es un problema del archivo |
| La URL firmada cambia cada vez / no sirve para guardar fija | `createSignedUrl` genera URLs con expiración y token — sólo tiene sentido en buckets privados; en un bucket público conviene `getPublicUrl` o armar la URL a mano |
| Se pierde la imagen y no hay forma de encontrarla de nuevo | No se guardó la `ruta` en ningún lado tras subirla — sin ese dato, no hay manera de reconstruir ni buscar el archivo |
| Queda una imagen subida sin usuario asociado | Falla el registro después de subir la imagen; no hay rollback automático porque Supabase sin funciones de servidor no lo garantiza |
| El insert en la tabla de usuarios falla | Falta RLS en esa tabla (select/insert) o el id no existe todavía en `auth.users` (la FK lo exige) |

## Referencia rápida

```typescript
// Subir
await supabase.storage.from('bucket').upload(ruta, file);

// URL pública (bucket público)
const { data } = supabase.storage.from('bucket').getPublicUrl(ruta);

// URL firmada con expiración (bucket privado)
await supabase.storage.from('bucket').createSignedUrl(ruta, 60 * 60 * 24 * 365);

// Descargar / eliminar
await supabase.storage.from('bucket').download(ruta);
await supabase.storage.from('bucket').remove([ruta]);
```

```typescript
// Capturar el File de un input
cargarImagen(event: Event) {
  const el = event.target as HTMLInputElement;
  if (el.files) control.setValue(el.files[0]);
}
```

## Links

- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)
- [Uploads](https://supabase.com/docs/guides/storage/uploads/standard-uploads)
