# Requerimientos: Mayor o menor

## Glosario

- **Mazo**: las 52 cartas que todavía no salieron.
- **Carta actual**: la que está a la vista y contra la que se compara.
- **Partida**: desde que se reparte la primera carta hasta que se pierden las vidas o se acaba el mazo.

## Requerimiento 1: Empezar una partida

**Historia:** como jugador, quiero empezar una partida para jugar.

1. CUANDO se abre la pantalla, EL sistema DEBE crear un mazo de 52 cartas y mostrar una carta sacada al azar.
2. CUANDO empieza la partida, EL sistema DEBE poner 3 vidas, 0 puntos y el temporizador en 0.

## Requerimiento 2: Elegir

**Historia:** como jugador, quiero adivinar si la próxima carta es mayor o menor.

1. EL sistema DEBE mostrar dos botones: Mayor y Menor.
2. CUANDO el jugador elige, EL sistema DEBE sacar otra carta al azar del mazo y mostrarla como carta actual.
3. CUANDO la nueva carta confirma la elección, EL sistema DEBE sumar 1 punto.
4. CUANDO la nueva carta contradice la elección, EL sistema DEBE restar 1 vida.
5. CUANDO las dos cartas tienen el mismo valor, EL sistema NO DEBE cambiar puntos ni vidas.

## Requerimiento 3: Temporizador

1. MIENTRAS dura la partida, EL sistema DEBE mostrar los segundos transcurridos.
2. CUANDO termina la partida, EL sistema DEBE frenar el temporizador.
3. CUANDO se sale de la pantalla, EL sistema DEBE frenar el temporizador.

## Requerimiento 4: Fin de partida

1. CUANDO las vidas llegan a 0, o el mazo se queda sin cartas, EL sistema DEBE terminar la partida.
2. CUANDO termina la partida, EL sistema DEBE ocultar los botones Mayor y Menor y mostrar puntos y tiempo.
3. CUANDO el jugador toca "Jugar de nuevo", EL sistema DEBE empezar una partida nueva (Requerimiento 1).
