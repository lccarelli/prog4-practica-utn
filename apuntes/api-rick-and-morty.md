# API de Rick and Morty

Referencia de `rickandmortyapi.com`. Todo lo de acá está verificado contra la
API el 25/08/2026, no copiado de la documentación.

```
Base: https://rickandmortyapi.com/api
```

Sin API key, sin registro, sin límite de peticiones documentado. Responde
`access-control-allow-origin: *`, así que se puede llamar desde el navegador sin
proxy. Sólo lectura: no acepta POST ni PUT.

## Recursos

```
GET https://rickandmortyapi.com/api/
{
  "characters": ".../api/character",
  "locations":  ".../api/location",
  "episodes":   ".../api/episode"
}
```

| Recurso     | Registros | Páginas |
| ----------- | --------- | ------- |
| `/character`| 826       | 42      |
| `/location` | 126       | 7       |
| `/episode`  | 51        | 3       |

20 resultados por página, siempre.

## La envoltura de las listas

Toda petición de lista devuelve `info` + `results`:

```json
{
  "info": {
    "count": 826,
    "pages": 42,
    "next": "https://rickandmortyapi.com/api/character?page=2",
    "prev": null
  },
  "results": [ ... ]
}
```

`next` y `prev` son `null` en los extremos. En la última página, `next` es
`null` y `results` puede traer menos de 20 (la 42 trae 6).

```typescript
export interface IRespuesta<T> {
  info: {
    count: number;
    pages: number;
    next: string | null;
    prev: string | null;
  };
  results: T[];
}
```

## Personaje

```json
{
  "id": 2,
  "name": "Morty Smith",
  "status": "Alive",
  "species": "Human",
  "type": "",
  "gender": "Male",
  "origin": { "name": "unknown", "url": "" },
  "location": { "name": "Citadel of Ricks", "url": ".../api/location/3" },
  "image": ".../api/character/avatar/2.jpeg",
  "episode": [".../api/episode/1", ".../api/episode/2"],
  "url": ".../api/character/2",
  "created": "2017-11-04T18:50:21.651Z"
}
```

```typescript
export interface IPersonaje {
  id: number;
  name: string;
  status: 'Alive' | 'Dead' | 'unknown';
  species: string;
  type: string;
  gender: 'Female' | 'Male' | 'Genderless' | 'unknown';
  origin: { name: string; url: string };
  location: { name: string; url: string };
  image: string;
  episode: string[];
  url: string;
  created: string;
}
```

Detalles que no están en la documentación:

- **`type` suele venir como string vacío**, no ausente ni `null`.
- **`origin.url` puede ser `""`** cuando el origen es `unknown`. Si armás un
  link con eso sin chequear, apunta a la página actual.
- `image` siempre está y siempre es 300×300 px. No hay personajes sin foto.
- `episode` es un array de **URLs**, no de objetos ni de ids. Para tener los
  episodios hay que pedirlos aparte.

## Ubicación

```json
{
  "id": 3,
  "name": "Citadel of Ricks",
  "type": "Space station",
  "dimension": "unknown",
  "residents": [".../api/character/8", ".../api/character/14"],
  "url": ".../api/location/3",
  "created": "2017-11-10T13:08:13.191Z"
}
```

```typescript
export interface IUbicacion {
  id: number;
  name: string;
  type: string;
  dimension: string;
  residents: string[];
  url: string;
  created: string;
}
```

## Episodio

```json
{
  "id": 1,
  "name": "Pilot",
  "air_date": "December 2, 2013",
  "episode": "S01E01",
  "characters": [".../api/character/1", ".../api/character/2"],
  "url": ".../api/episode/1",
  "created": "2017-11-10T12:56:33.798Z"
}
```

```typescript
export interface IEpisodio {
  id: number;
  name: string;
  air_date: string;
  episode: string;
  characters: string[];
  url: string;
  created: string;
}
```

`air_date` es texto libre en inglés (`"December 2, 2013"`), no una fecha ISO.
Para ordenarlo cronológicamente hay que parsearlo.

## Traer por id

```
GET /character/2        → un objeto
GET /character/1,183    → un array
GET /character/[1,183]  → un array
```

**El tipo de la respuesta cambia según cuántos ids pidas.** Con uno devuelve el
objeto pelado; con varios, un array. En TypeScript conviene tener dos métodos
distintos en el servicio en lugar de uno que devuelva `IPersonaje | IPersonaje[]`.

Ninguna de estas dos formas trae la envoltura `info`/`results`.

## Paginación

```
GET /character?page=2
```

Se combina con los filtros: `?status=alive&species=alien&page=2`.

Para saber cuántas páginas hay, `info.pages`. Para saber si hay siguiente,
`info.next !== null`.

## Filtros

Se encadenan con `&`.

| Recurso     | Filtros disponibles                          |
| ----------- | -------------------------------------------- |
| `/character`| `name`, `status`, `species`, `type`, `gender`|
| `/location` | `name`, `type`, `dimension`                  |
| `/episode`  | `name`, `episode`                            |

Valores cerrados:

- `status`: `alive`, `dead`, `unknown`
- `gender`: `female`, `male`, `genderless`, `unknown`

### Cómo se comportan

Verificado probando:

| Consulta | Resultados |
| -------- | ---------- |
| `?name=rick` | 107 |
| `?name=RICK` | 107 |
| `?name=ric` | 116 |
| `?status=alive` | 439 |
| `?status=Alive` | 439 |
| `?status=dead` | 287 |
| `?status=unknown` | 100 |
| `?episode=S01` | 11 |
| `?episode=S01E01` | 1 |

O sea: **coincidencia parcial e insensible a mayúsculas**, y la subcadena puede
estar en cualquier parte del nombre, no sólo al principio. Los nombres que
`ric` trae y `rick` no incluyen `Ricardo Montoya` y `Richard`, pero también
`Arthricia`, `Numbericon` y `Tricia Lange`.

Eso alcanza para armar un buscador sin escribir nada del lado del cliente: se
manda lo que el usuario tipea y la API filtra. Y `?episode=S01` sirve para traer
toda una temporada.

Un valor inválido en un filtro cerrado (`?status=vivo`) no da error de
validación: devuelve 404.

## Errores

**Todo lo que no encuentra devuelve 404**, nunca una lista vacía.

| Situación | Código | Cuerpo |
| --------- | ------ | ------ |
| Filtro sin resultados | 404 | `{"error":"There is nothing here"}` |
| Página fuera de rango | 404 | `{"error":"There is nothing here"}` |
| Id inexistente | 404 | `{"error":"Character not found"}` |
| Valor inválido en un filtro | 404 | `{"error":"There is nothing here"}` |

Esto es lo más importante de todo el documento si vas a hacer un buscador. Con
`HttpClient`, un 404 **no llega por el `next` del observable sino por el canal
de error**, así que la primera vez que alguien busque algo que no existe se te
rompe la pantalla si no lo manejás.

En Angular se resuelve con `catchError` en el servicio, devolviendo una
respuesta vacía en lugar de propagar el error.

## GraphQL

```
POST https://rickandmortyapi.com/graphql
```

Misma información, con la ventaja de pedir sólo los campos que se usan. No hace
falta para la cursada, pero existe.

## Notas para usarla desde Angular

- **Los parámetros van con `HttpParams`**, no concatenando strings. Se encarga
  de codificar los espacios y los caracteres raros.
- **Las imágenes se cargan desde el dominio de la API.** Con `[src]="personaje.image"`
  funciona directo; no hace falta descargarlas.
- **Las respuestas se cachean 90 días** (`cache-control: public, max-age=7776000,
  immutable`). Si en el navegador ves que no se repite el pedido de red, no es
  un bug tuyo.
- **Los campos `episode`, `residents` y `characters` son URLs.** Resolverlos uno
  por uno son N peticiones; conviene extraer los ids y pedirlos todos juntos con
  la forma `/character/1,2,3`.

## Links

- [Documentación oficial](https://rickandmortyapi.com/documentation)
- [HttpClient en Angular](https://angular.dev/guide/http)
- [Peticiones](https://angular.dev/guide/http/making-requests)
