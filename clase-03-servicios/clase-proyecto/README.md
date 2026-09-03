# Clase 03 — Input, output, servicios y HTTP · proyecto

El apunte de la clase está en [`../clase-apunte/apunte.md`](../clase-apunte/apunte.md).

```bash
nvm use
npm ci
npm start        # http://localhost:4200
```

Un catálogo de personajes contra la API pública de Rick and Morty (referencia en [`clase-apunte/api-rick-and-morty.md`](../clase-apunte/api-rick-and-morty.md)). Usa **Tailwind** para los estilos.

## Estructura

```
src/app/
├── app.config.ts              provideHttpClient()
├── app.routes.ts              Una ruta: el catálogo
├── interfaces/
│   ├── personaje.ts           La forma de cada personaje
│   └── respuesta.ts           La forma genérica de la respuesta paginada
├── servicios/
│   └── personajes.ts          HttpClient: getPersonajes()
└── pages/catalogo/
    ├── catalogo.ts            Se suscribe en ngOnInit, se desuscribe en ngOnDestroy
    └── personaje-card/        input() del personaje, output() para favoritos
```

## Qué mirar

- **`personajes.ts`**: el servicio sólo devuelve el observable. El que se suscribe es el componente.
- **`catalogo.ts`**: la respuesta se guarda en signals (`personajes`, `total`, `cargando`, `error`) y la suscripción se corta en `ngOnDestroy`.
- **`personaje-card`**: recibe el personaje con `input.required()` y avisa con `output()` cuando tocan "Agregar a favoritos". La tarjeta no modifica nada: el padre decide.
- **`recibirFavorito()`**: agrega con `[...lista, personaje]`, no con `push`. Es la trampa del punto 3.
