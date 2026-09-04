# Clase 06 — Supabase Database, RLS y Realtime

**Fecha:** 03/09/2026 · **Angular:** 22.1.0 · **@supabase/supabase-js:** ^2.112.4

Video: *"Clase 06 - Supabase DB, RLS y Realtime"*, partes 1 y 2.

## Qué se dio

- CRUD contra una tabla de Supabase (Table Editor y sintaxis JS)
- Row Level Security: políticas por rol, admin por metadata
- Realtime: escuchar cambios de una tabla y broadcast propio

El ejemplo en vivo fue una tabla **`autos`** (marca, modelo, precio) — un CRUD
sencillo elegido al azar, sin relación con ningún TP.

---

## 1. Crear la tabla

Table Editor → esquema `public` → New table. Dos cosas se apagan al crear:

- **Row Level Security**: si queda prendida sin políticas, bloquea *todo*.
  Se apaga para probar la conexión primero, se prende cuando se van a
  escribir las políticas.
- **Realtime**: si no se va a usar en la tabla, se deja apagado hasta que
  haga falta.

Columnas: `id` (pk automática), `created_at` (default `now()`), y las
propias (`marca`, `modelo` texto nulable; `precio` numeric).

Esto también se puede hacer 100% por SQL Editor (`create table ...`) — es
lo mismo, cambia sólo la sintaxis.

## 2. Dos interfaces por entidad

```typescript
export interface Auto {
  id: number;
  created_at: any; // timestamp — revisar tipo exacto
  marca: string | null;
  modelo: string | null;
  precio: string | null;
}

export interface AutoPorCrear {
  marca: string | null;
  modelo: string | null;
  precio: string | null;
}
```

`AutoPorCrear` no tiene `id` ni `created_at` porque esos los genera
Supabase — nunca se mandan al crear. Es el mismo concepto de los DTO que se
retoma más adelante con NestJS.

## 3. CRUD contra Supabase

```typescript
// find all
const { data, error, count, status, statusText } = await this.supabase.Supabase
  .from('autos')
  .select('*'); // o 'marca, modelo' para columnas puntuales

// find by id
.from('autos').select('*').eq('id', id)

// create
.from('autos').insert({ marca: auto.marca, modelo: auto.modelo, precio: auto.precio })

// update (el where es obligatorio, si no modifica todo)
.from('autos').update({ marca, modelo, precio }).eq('id', id)

// delete
.from('autos').delete().eq('id', id)
```

`from(tabla)` elige la tabla, después se encadenan los métodos SQL
(`select`, `insert`, `update`, `delete`) y filtros (`eq`, `gt`, `gte`,
`lt`, `lte`, `like`, `in`, `neq`, `limit`, `range` para paginar con
offset, `single` para un solo resultado). Siempre devuelve
`{ data, error, count, status, statusText }` — sólo `data` y `error`
importan casi siempre.

**El formulario manda un `id` nulo si no lo oculta bien.** Si el mismo
`FormGroup` se reusa para crear y editar, el campo `id` viaja igual
aunque esté oculto, y Supabase rechaza un `insert` con `id: null`. Hay que
borrar esa clave del objeto antes de mandarlo, no basta con "castear" el
tipo en TypeScript — el cast no filtra nada en runtime.

## 4. RLS — políticas por acción

Con RLS activo, sin políticas nada funciona: ni un `select`. Se crean desde
**Authentication → Policies** (o por SQL, es lo mismo).

```sql
-- select público
create policy "select es publico" on autos for select using (true);

-- insert solo autenticados
create policy "insert autenticados" on autos for insert
  to authenticated with check (true);
```

`using (true)` = sin condición, siempre pasa. El chequeo real va en el
`using`/`with check` cuando hace falta comparar algo.

### Definir un admin sin tabla nueva

Se puede guardar `role: 'admin'` en el `user_metadata` al registrar (mismo
mecanismo que los datos extra de la clase 05), y la política lee ese dato
del JWT:

```sql
create policy "admin todo" on autos for all
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
```

`->` extrae JSON, `->>` extrae como texto — por eso hay dos flechas
distintas: la primera navega el JSON anidado, la segunda saca el string
final para comparar.

**Ojo:** el rol de Supabase (`authenticated` / `anon`) es otra cosa —
identifica si hay sesión, no es un campo editable para poner "admin" ahí.
El rol de negocio (admin/cliente/empleado) es responsabilidad de la app,
guardado en metadata o en una tabla propia.

### Política "sólo el dueño puede modificar lo suyo"

Patrón útil si una fila tiene un `usuario_id`:

```sql
using (auth.uid() = usuario_id)
```

Sirve para "cada uno borra sus propios posteos", por ejemplo.

## 5. Realtime

Se activa por tabla (ícono del ojo/mouse en Table Editor → Enable
Realtime, o Database → Replication). Tres conceptos:

- **Broadcast**: mensajes propios, cualquier cliente envía y cualquier
  otro escucha — no toca la base.
- **Presence**: detectar quién está conectado (no se vio en clase).
- **Postgres Changes**: el que se usó — Supabase emite un evento cuando la
  tabla tiene un `insert`/`update`/`delete`.

```typescript
const channel = this.supabase.Supabase
  .channel('table-db-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'autos' },
    (payload) => {
      switch (payload.eventType) {
        case 'INSERT':
          this.autos.update((prev) => [...prev, payload.new as Auto]);
          break;
        case 'UPDATE': {
          const i = this.autos().findIndex((a) => a.id === (payload.new as Auto).id);
          const copia = [...this.autos()];
          copia[i] = payload.new as Auto;
          this.autos.set(copia);
          break;
        }
        case 'DELETE': {
          const i = this.autos().findIndex((a) => a.id === (payload.old as Auto).id);
          const copia = [...this.autos()];
          copia.splice(i, 1);
          this.autos.set(copia);
          break;
        }
      }
    },
  )
  .subscribe();
```

**La suscripción vive en el componente, no en el servicio.** El servicio
sólo expone el cliente de Supabase; el canal se crea y se destruye en el
componente que lo usa, para poder desuscribirse en `ngOnDestroy` —mismo
patrón que el `clearInterval` de la clase 02. Sin el `unsubscribe`, entrar
y salir del componente varias veces crea suscripciones duplicadas y cada
evento se procesa 2, 3, 4 veces.

`event: '*'` escucha las tres operaciones; se puede filtrar a sólo
`'INSERT'` si no importa el resto. El `.subscribe()` final es obligatorio
— sin él, el `.on(...)` no arranca a escuchar.

### Broadcast propio (mensajería entre clientes, sin tabla)

```typescript
// escuchar
this.supabase.Supabase.channel('test')
  .on('broadcast', { event: 'click' }, (msg) => console.log(msg))
  .subscribe();

// enviar
this.supabase.Supabase.channel('test')
  .send({ type: 'broadcast', event: 'click', payload: { mensaje: 'hola' } });
```

Nadie recibe su propio mensaje (no hace falta filtrarlo a mano). Útil para
notificar algo entre pestañas/dispositivos sin persistir nada.

---

## Cosas que confunden

| Síntoma | Causa |
| ------- | ----- |
| El insert falla mandando `id: null` | El formulario reusado entre crear/editar siempre incluye el campo `id`; hay que eliminarlo del objeto antes del insert |
| RLS activo y nada funciona, ni leer | Sin políticas, RLS bloquea todo por defecto — hay que crear al menos la de `select` |
| El `delete`/`update` no da error aunque no haya podido hacer nada | Supabase no siempre reporta error cuando 0 filas fueron afectadas por RLS — conviene revisar `count` |
| La política de admin no anda | Confundir el rol de Supabase (`authenticated`/`anon`, sólo dice si hay sesión) con un rol de negocio propio guardado en metadata |
| El evento de Realtime nunca llega | Falta el `.subscribe()` al final de la cadena, o la tabla no tiene Realtime habilitado |
| Se procesa el mismo cambio 2+ veces | La suscripción se crea de nuevo cada vez que se entra al componente porque no se limpió en `ngOnDestroy` |

## Referencia rápida

```typescript
// CRUD
supabase.from('tabla').select('*');
supabase.from('tabla').select('*').eq('id', id).single();
supabase.from('tabla').insert({ ...campos });
supabase.from('tabla').update({ ...campos }).eq('id', id);
supabase.from('tabla').delete().eq('id', id);

// Realtime
const canal = supabase
  .channel('nombre')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tabla' }, (payload) => {})
  .subscribe();
canal.unsubscribe(); // en ngOnDestroy
```

```sql
-- RLS
create policy "nombre" on tabla for select using (true);
create policy "nombre" on tabla for insert to authenticated with check (true);
create policy "nombre" on tabla for all
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
```

## Links

- [Supabase Database](https://supabase.com/docs/guides/database/overview)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
