# Diseño: Mayor o menor

## Piezas

```
src/app/
├── interfaces/carta.ts        { valor: number (1-13), palo: string }
├── services/mazo.ts           crear(): Carta[] · sacar(mazo): Carta
└── mayor-o-menor/             el juego: estado, reglas, temporizador
```

`App` muestra `<app-mayor-o-menor />`. No hay rutas.

## Servicio `Mazo`

- `crear()`: devuelve un array nuevo con las 52 combinaciones de valor (1 a 13) y palo (picas, corazones, diamantes, tréboles).
- `sacar(mazo)`: elige una posición al azar con `Math.random()`, la saca del array con `splice` y devuelve esa carta. **Modifica el array que recibe**: así el mazo no repite cartas.

El servicio no guarda estado: el mazo vive en el componente.

## Componente `MayorOMenor`

Estado, todo en signals:

| Signal | Tipo | Inicial |
| ------ | ---- | ------- |
| `actual` | `Carta \| null` | primera carta |
| `vidas` | `number` | 3 |
| `puntos` | `number` | 0 |
| `segundos` | `number` | 0 |
| `terminada` | `boolean` | false |

El mazo es un array común (`private mazo: Carta[]`): no se muestra, no necesita ser signal.

Métodos:

- `iniciar()`: crea el mazo, saca la primera carta, resetea los signals y arranca el `setInterval` del temporizador.
- `elegir(eleccion: 'mayor' | 'menor')`: saca la siguiente, compara contra `actual`, actualiza puntos o vidas, pone la nueva como `actual`, y llama a `terminar()` si `vidas` es 0 o el mazo quedó vacío.
- `terminar()`: `terminada = true` y `clearInterval`.
- `ngOnInit` llama a `iniciar()`. `ngOnDestroy` hace `clearInterval` (clase 02).

## Pantalla

- Carta actual como texto (`nombre(carta)`: 1 → "As", 11 → "J", 12 → "Q", 13 → "K").
- Vidas, puntos, segundos y cartas restantes.
- Si no terminó: botones Mayor y Menor. Si terminó: resultado y "Jugar de nuevo".

## Fuera de alcance

Rankings, persistencia, login, animaciones.
