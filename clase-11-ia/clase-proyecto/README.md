# Clase 11 — Un juego hecho con SDD · proyecto

El apunte de la clase está en [`../clase-apunte/apunte.md`](../clase-apunte/apunte.md).

```bash
nvm use
npm ci
npm start        # http://localhost:4200
```

Este proyecto es el último paso de un **Spec Driven Development** chico, para ver el proceso de la clase de punta a punta. Los documentos están en [`../clase-apunte/sdd-mayor-o-menor/`](../clase-apunte/sdd-mayor-o-menor/) y se leen en orden:

1. [`1-prompt.md`](../clase-apunte/sdd-mayor-o-menor/1-prompt.md): lo que escribe el programador, con las reglas del juego decididas. En clase, Mayor o menor salió sin botones justamente porque las reglas no estaban.
2. [`2-requirements.md`](../clase-apunte/sdd-mayor-o-menor/2-requirements.md): requerimientos con criterios de aceptación.
3. [`3-design.md`](../clase-apunte/sdd-mayor-o-menor/3-design.md): piezas, estado y métodos.
4. [`4-tasks.md`](../clase-apunte/sdd-mayor-o-menor/4-tasks.md): las 7 tareas. La primera (`ng new` y `ng generate`) se hace a mano.

## Estructura

```
src/app/
├── interfaces/carta.ts        valor y palo
├── services/mazo.ts           crear() las 52 cartas · sacar() una al azar
└── mayor-o-menor/             estado en signals, reglas y temporizador
```

## Qué mirar

- **Cada pieza responde a una tarea**, y cada test a un criterio de aceptación de `2-requirements.md`. Por ejemplo, "igual valor no cambia nada" es el 2.5.
- **`mazo.ts`**: `sacar()` usa `splice`, que modifica el array que recibe. Así no se repiten cartas, y el servicio no guarda estado.
- **`mayor-o-menor.ts`**: el temporizador es el de la clase 02: `setInterval` al iniciar y `clearInterval` al terminar y en `ngOnDestroy`.
- **`mayor-o-menor.spec.ts`**: para probar las reglas sin azar, el test arma el mazo a mano y fija `Math.random` con `vi.spyOn`. Testing no se dio en la cursada; el profe dijo que lo da al final, si sobra tiempo.
