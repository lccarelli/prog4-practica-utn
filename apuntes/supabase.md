# Supabase

Proyecto creado el 01/09/2026 para la clase 05 (auth). La cátedra publicó una
"Guía Básica de Supabase" en el campus, sección Unificados.

## Datos del proyecto

| | |
| --- | --- |
| Project ref | `vrkcaykkxfyfgntmqmji` |
| URL | `https://vrkcaykkxfyfgntmqmji.supabase.co` |
| Dashboard | https://supabase.com/dashboard/project/vrkcaykkxfyfgntmqmji |

```
sb_publishable_YGld9NA8YtzH8LWA5w0E1w_YVgjo1JC
```

Esa es la **publishable key**. Va en el código del cliente y **no es secreta**:
viaja en el bundle que descarga cualquier visitante. Lo que impide que alguien
haga desastres con ella es Row Level Security, no el secreto de la clave.

> **La contraseña de la base de datos no está acá.** Es la del superusuario de
> Postgres y no la limita ninguna política. Vive en `secretos.local.md`, que
> está en `.gitignore` porque este repositorio es público.

## CLI

```bash
supabase login
supabase init
supabase link --project-ref vrkcaykkxfyfgntmqmji
```

## Las dos claves de Supabase

| Clave | Dónde va | Secreta |
| --- | --- | --- |
| `sb_publishable_...` | cliente, bundle del navegador | no |
| `sb_secret_...` (service role) | sólo servidor | **sí** |

La segunda **saltea Row Level Security**. Si termina en el front, cualquiera lee
y escribe toda la base. Para el TP2 con Nest va del lado del servidor.

## Row Level Security

Al crear una tabla desde el dashboard, RLS viene **activado y sin políticas**:
todo queda bloqueado, incluso para vos. No es un error de configuración — hay
que escribir las políticas.

## Links

- [Guía de Angular con Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/angular)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Auth](https://supabase.com/docs/guides/auth)
