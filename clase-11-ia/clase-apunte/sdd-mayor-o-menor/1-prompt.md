# Prompt

Lo que escribe el programador. Corto, en bloques, con las decisiones ya tomadas.

```
Tecnologías: Angular 22, sin librerías extra. Sin backend.
Alcance: un solo juego, Mayor o menor, en una sola pantalla.
Cartas: mazo de 52 (valores 1 a 13, cuatro palos). Se muestran como texto: "7 de corazones". Sin emojis.
Reglas:
- Se muestra una carta. El jugador elige Mayor o Menor. Se saca la siguiente.
- Acierta: +1 punto. Falla: -1 vida. Igual valor: no suma ni resta.
- 3 vidas. Termina sin vidas o sin cartas.
Temporizador: segundos desde que arranca la partida; se frena al terminar.
Fin: mostrar puntos y tiempo, y un botón para jugar de nuevo.
Código: interfaz Carta, servicio Mazo (crear, sacar al azar), componente del juego con signals.
No hacer: rankings, login, Supabase, estilos elaborados.
```
