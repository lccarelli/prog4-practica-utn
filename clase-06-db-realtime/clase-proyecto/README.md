# Clase 06 — Supabase Database, RLS y Realtime · proyecto

El apunte de la clase está en [`../clase-apunte/apunte.md`](../clase-apunte/apunte.md).

```bash
nvm use
npm ci
npm start        # http://localhost:4200
```

Antes de levantarlo, crear la tabla: copiar [`../clase-apunte/autos.sql`](../clase-apunte/autos.sql) en el **SQL Editor** de Supabase y ejecutarlo. Crea `autos`, activa RLS con sus políticas y la suma a Realtime. Usa el proyecto de [`../../clase-05-auth/clase-apunte/supabase.md`](../../clase-05-auth/clase-apunte/supabase.md).

Creado con `ng new` y `ng generate`, sin nada de clases anteriores.

## Estructura

```
src/app/
├── app.html                   Muestra los dos componentes
├── interfaces/auto.ts         Auto y AutoPorCrear (sin id ni created_at)
├── services/
│   ├── supabase.ts            Crea el cliente
│   └── db.ts                  findAll, create, update, delete
├── autos/                     CRUD + Realtime con postgres_changes
└── broadcast/                 Mensajes entre pestañas, sin tabla
```

## Qué mirar

- **`db.ts`**: `from('autos')` y después la operación. El `update` y el `delete` llevan `.eq('id', id)`: sin el filtro modifican toda la tabla.
- **`autos.ts`**: el mismo formulario sirve para crear y para editar, pero el `id` **no está en el formulario**: se guarda aparte en `editando`. Así nunca viaja un `id: null` en el insert (ver "Cosas que confunden" en el apunte).
- **`autos.ts`, Realtime**: el canal se abre en `ngOnInit` y se cierra en `ngOnDestroy`. La lista no se recarga después de crear, editar o eliminar: se actualiza sola cuando llega el evento. Abrí dos pestañas para verlo.
- **`broadcast.ts`**: el mensaje llega a las otras pestañas y no a la que lo manda.
- **`autos.sql`**: la política de escritura es para `anon` porque este ejemplo no tiene login. Con auth (clase 05) sería `to authenticated`, o la de admin por `user_metadata` que está en el apunte.
