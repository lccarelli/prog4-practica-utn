# Tareas: Mayor o menor

- [x] 1. **A mano**: crear el proyecto y las piezas con el CLI
  - `ng new clase-proyecto --style=css --ssr=false --ai-config=none --skip-git`
  - `ng generate interface interfaces/carta`
  - `ng generate service services/mazo`
  - `ng generate component mayor-o-menor`
  - _Diseño: Piezas_

- [x] 2. Interfaz `Carta`
  - _Diseño: Piezas_

- [x] 3. Servicio `Mazo`: `crear()` y `sacar()`
  - Test: `crear()` devuelve 52 cartas distintas; `sacar()` achica el mazo en 1
  - _Requerimiento 1.1, 2.2_

- [x] 4. Componente: estado, `iniciar()` y `elegir()`
  - Test: acierto suma, error resta vida, igual no cambia nada, sin vidas termina
  - _Requerimientos 1.2, 2.3, 2.4, 2.5, 4.1_

- [x] 5. Temporizador con `setInterval` y `clearInterval` en `terminar()` y `ngOnDestroy`
  - _Requerimiento 3_

- [x] 6. Plantilla: carta, contadores, botones y fin de partida
  - _Requerimientos 2.1, 4.2, 4.3_

- [x] 7. `App` muestra el juego; `<title>` propio
