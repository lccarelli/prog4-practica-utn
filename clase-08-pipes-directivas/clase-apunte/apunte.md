# Clase 08 — Pipes, directivas y deploy

**Fecha:** 10/09/2026 · **Angular:** 22.1.0

Video: *"Clase 08 - Pipes, directivas y deploy"*, partes 1 y 2.

## Qué se dio

- Pipes: los que trae Angular y cómo escribir uno propio
- Directivas de atributo propias (con eventos e `input()`)
- Deploy completo en Vercel y en Render, con sus diferencias

El ejemplo en vivo de pipes fue un **pipe de texto largo** (trunca con
puntos suspensivos, con un largo máximo configurable) y un **pipe de fecha
relativa** ("hace 2 días"). El de directivas fue un **`appHighlight`**
que resalta cualquier elemento al pasar el mouse, con el color
configurable por un `input()`.

---

## 1. Por qué existen los pipes

El ejemplo que usó para arrancar fue una fecha guardada tal cual la
maneja una base de datos: en formato **Unix** (milisegundos desde el
1/1/1970 — un número, ocupa poco y no hay que parsear nada para guardarlo)
o en formato **timestamp** tipo ISO (un string como `2026-09-08T18:20:21.49Z`).
Ninguno de los dos está pensado para que lo vea un usuario — mostrarlos
"como están guardados" en el HTML da justamente ese `Thu Sep 08 2026...`
horrible que se ve al mandar una `Date` cruda a la plantilla.

La idea: **el dato se guarda en el formato más chico y neutro posible**
(un timestamp, un número), y **la transformación al formato que ve el
usuario pasa siempre al final**, en la plantilla — nunca antes, nunca
guardada en una variable nueva. Si se guardara la versión ya formateada en
otra variable, se duplica memoria y hay que mantener sincronizadas dos
copias del mismo dato — la variable en memoria queda viva hasta que se
destruye el componente, mientras que una transformación hecha en el pipe
se calcula al momento de renderizar y se descarta enseguida.

```html
<!-- mal: concatenar/formatear a mano en la plantilla -->
{{ fecha.getFullYear() + '/' + fecha.getMonth() }}

<!-- bien: la transformación queda declarada, no calculada a mano -->
{{ fecha | date: 'dd/MM/yyyy' }}
```

## 2. Pipes que trae Angular

Todas de `@angular/common`, hay que importarlas en el componente standalone:

```typescript
imports: [DatePipe, CurrencyPipe, DecimalPipe, PercentPipe, TitleCasePipe, AsyncPipe]
```

```html
{{ nombre | titlecase }}
{{ fecha | date: 'dd/MM/yyyy HH:mm' }}       <!-- HH mayúscula = 24hs -->
{{ fecha | date: 'dd/MM/yyyy HH:mm':'-03:00' }} <!-- fuerza timezone -->
{{ precio | currency: 'ARS':'symbol':'1.2-2' }} <!-- código:display:digitsInfo -->
{{ numero | number: '1.2-2' }}    <!-- enteros.mínDecimales-máxDecimales -->
{{ numero | percent }}
```

Un pipe se llama con `|`, y los parámetros después de `:`. Internamente
cada pipe implementa un método `transform(value, ...args)` — el valor a la
izquierda del `|` es siempre el primer argumento.

**`AsyncPipe`** resuelve una promesa u observable directo en el HTML sin
`subscribe()` manual: mientras no resuelve, no muestra nada; cuando
resuelve, renderiza el valor. Poco uso esperado en el TP.

**Zonas horarias otra vez:** una fecha guardada en UTC se muestra corrida
si no se le indica el offset (`-03:00` para Argentina) en el propio
formato del `date` pipe.

El tercer parámetro del `currency` pipe (`display`) tiene tres valores:
`'code'` (`ARS`), `'symbol'` (`$`, el default) y `'symbol-narrow'` (una
versión más corta del símbolo, sólo existe para algunas monedas). El
separador decimal (coma vs. punto) no se puede cambiar sin configurar
`locale` — tema que no se vio en la cursada, queda con el default en
inglés (punto).

## 3. Pipe propio

```bash
ng generate pipe pipes/texto-largo
```

```typescript
@Pipe({ name: 'textoLargo' })
export class TextoLargoPipe implements PipeTransform {
  transform(value: string, largoMaximo: number = 15): string {
    if (value.length > largoMaximo) {
      return value.slice(0, largoMaximo) + '...';
    }
    return value;
  }
}
```

```html
{{ texto | textoLargo }}
{{ texto | textoLargo: 30 }}
```

El nombre del `@Pipe` es el selector que se usa después del `|` — igual
que el `selector` de un componente. Los parámetros extra son opcionales
con valor por defecto, para no romper donde se usa sin parámetros.

**El TP tiene que tener al menos uno o dos pipes propios** — usar sólo los
de Angular no alcanza como criterio de evaluación. El profesor lo remarcó
explícitamente: de todos los temas dados en la cursada, **pipes y
directivas son los únicos dos que piden código 100% propio** — el resto
de la app usa herramientas ya dadas (Supabase es obligatorio tal cual se
enseñó; los `Validators` de formularios quedan a criterio, propios o no).

## 4. Directivas de atributo

El concepto general de directiva es **código pensado para aplicarse a una
parte del DOM** — un elemento, no importa cuál (input, botón, div,
párrafo, etc.). Hay tres sabores, y los tres son "directivas" en el
sentido estricto de Angular:

- **De componente**: la que ya conocemos — tiene su propio HTML/template,
  se inserta como una etiqueta nueva (`<app-login>`).
- **Estructural**: cambia la estructura del DOM — muestra/oculta u
  itera elementos. `@if`, `@for`, `@switch` son esto, sólo que con la
  sintaxis moderna de control flow en vez de la vieja `*ngIf`/`*ngFor`.
- **De atributo**: no tiene HTML propio, se "adosa" como atributo a un
  elemento que ya existe en cualquier parte de la app y le agrega o
  modifica comportamiento. Es la que se arma desde cero en esta clase.

Una directiva de atributo es entonces "como un componente sin plantilla
propia": mismo tipo de clase e inyección, pero pensada para adosarse a un
elemento del DOM ya existente en cualquier parte de la app, en vez de
tener su propio HTML.

Ya se venían usando directivas de atributo integradas sin llamarlas así:
`[class.x]`, `[style.x]`, `formGroup` son todas directivas de atributo
que trae Angular.

### Bindear clases y estilos condicionalmente (sin directiva propia)

```typescript
esRojo = signal(false);
esNegrita = signal(false);
```

```html
<p [class.rojo]="esRojo()" [class.negrita]="esNegrita()">...</p>
<p [style.color]="esRojo() ? 'red' : 'black'">...</p>
```

Esto reemplaza por completo el patrón de PR3 de tomar el elemento a mano y
tocarle `classList.add/remove` — Angular reacciona solo al cambio de la
signal.

### Directiva de atributo propia

```bash
ng generate directive directives/highlight
```

```typescript
@Directive({
  selector: '[appHighlight]',
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
})
export class Highlight {
  private el: ElementRef<HTMLElement> = inject(ElementRef);
  appHighlight = input('');

  onMouseEnter() {
    this.resaltar(this.appHighlight() || 'red');
  }

  onMouseLeave() {
    this.resaltar('');
  }

  resaltar(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
```

```html
<p appHighlight>resalta en rojo (default)</p>
<p appHighlight="blue">resalta en azul</p>
<p [appHighlight]="colorElegido">resalta con el color de una variable</p>
```

- `ElementRef` + `.nativeElement` da acceso directo al DOM real — el mismo
  nivel de acceso de PR3, pero encapsulado y reutilizable en cualquier
  elemento.
- **`host: { '(evento)': 'metodo()' }`** dice qué eventos escucha la
  directiva sobre su elemento. En clase el profesor arrancó con el
  decorador `@HostListener('mouseenter')`, vio en la documentación que ya
  no se recomienda y lo cambió por `host`. Por qué, no lo confirmó
  (especuló que es por performance: se declaran de entrada los eventos a
  escuchar). Las comillas del nombre del evento son obligatorias.
- El `input()` funciona igual que en un componente. Cuando se llama
  **igual que el selector** (`appHighlight`), el valor se pasa con el
  propio atributo: sin corchetes es un texto fijo (`appHighlight="blue"`),
  con corchetes es una expresión (`[appHighlight]="colorElegido"`).
- El `|| 'red'` está en el método y no como valor inicial del `input`:
  si alguien pasa un texto vacío, igual resalta.

## 5. Deploy — Vercel

Antes de deployar: el repo del TP tiene que estar en GitHub con el
proyecto **en la raíz** (el `package.json` visible al entrar, no dentro de
una carpeta suelta) — confirmado explícitamente por el profesor como tarea
para antes de esta clase.

```bash
git init          # Angular ya lo corre solo al crear el proyecto
git branch -m main
git remote add origin <url>
git add .
git commit -m "inicial"
git push origin main
```

**Ojo con un `.git` anidado**: si el proyecto de Angular ya trae su propio
`.git` (lo genera `ng new` solo) y después se hace `git init` de nuevo en
una carpeta padre, queda un repo dentro de otro y GitHub lo sube raro (esa
subcarpeta aparece como un link roto, no navegable). Hay que saber
exactamente dónde quedó el `.git` real.

En Vercel: cuenta creada con GitHub (más simple para conectar), **New
Project → Import Git Repository**, elegir el repo. Vercel detecta Angular
solo (framework preset), no hace falta tocar build command ni output
directory — los adivina bien. **Deploy**, listo.

- El build real que corre Vercel es `npm install` + `npm run build`
  (`ng build` bajo el capó) → guarda todo en `dist/<nombre-proyecto>/browser`.
- Cada push a la rama conectada dispara un nuevo deploy automático.
- Hay **dos URLs por deploy**: la de cada commit (privada, sólo la ve el
  dueño del proyecto en Vercel) y la del dominio del proyecto (pública,
  `nombre-proyecto.vercel.app` — **esta es la que se comparte**).
- Un deploy roto (build que falla) nunca reemplaza al último que funcionó
  — producción se queda en la última versión buena.
- `git reset --hard HEAD~1` + `git push --force` "deshace" un commit, pero
  Vercel sólo redeploya en un **push** nuevo — un force push no siempre
  dispara nada porque el hash puede coincidir con lo ya deployado; si hace
  falta, se puede forzar un redeploy manual desde la lista de deployments.

## 6. Deploy — Render (alternativa, más manual)

Mismo flujo de conectar GitHub, pero Render no adivina tanto solo:

- Hay que indicar a mano el **build command** (`npm install && npm run build`)
  y el **output/publish directory**, que es `dist/<nombre-proyecto>/browser`
  — si se deja `dist` a secas (el default), el deploy "funciona" pero no
  encuentra el `index.html` y no muestra nada.
- La versión de Node se configura aparte (variable de entorno
  `NODE_VERSION` o similar) — si Render trae una versión vieja por
  defecto y el proyecto pide Node 24, el build falla explícitamente
  avisando la versión.

**No usar Netlify para Angular**: no soporta bien el enrutamiento virtual
que usa el Router de Angular (rutas que no son archivos reales en el
server) — arranca pero las rutas internas fallan. Mencionado explícitamente
como advertencia, en particular contra plataformas de IA que suben ahí por
default.

---

## Cosas que confunden

| Síntoma | Causa |
| ------- | ----- |
| El pipe no formatea nada / tira error de argumentos | Falta importar el pipe en el componente standalone, o falta un parámetro sin valor por defecto |
| La fecha se ve corrida un par de horas | Falta indicar el timezone en el formato del `date` pipe; se guarda en UTC y no se ajusta solo |
| `host` no reacciona | Falta el nombre del evento entre comillas (`'(mouseenter)'`) |
| El repo sube con una carpeta suelta adentro | El proyecto de Angular no estaba en la raíz al hacer `git init`, o hay un `.git` anidado sin detectar |
| Deploy en Render no muestra nada (pantalla en blanco) | El output directory quedó en `dist` en vez de `dist/<proyecto>/browser` |
| El build falla en Render con error de versión | Node desactualizado respecto al que pide el proyecto — hay que fijar `NODE_VERSION` a mano |
| Rutas internas rotas en producción | Se deployó a Netlify, que no soporta el ruteo de Angular |

## Referencia rápida

```typescript
@Pipe({ name: 'miPipe' })
export class MiPipe implements PipeTransform {
  transform(value: T, ...args: any[]): R { ... }
}
```

```typescript
@Directive({
  selector: '[miDirectiva]',
  host: { '(evento)': 'handler()' },
})
export class MiDirectiva {
  miDirectiva = input('default');
  private el: ElementRef<HTMLElement> = inject(ElementRef);

  handler() { ... }
}
```

```bash
ng generate pipe pipes/nombre
ng generate directive directives/nombre
```

## Links

- [Pipes](https://angular.dev/guide/templates/pipes)
- [Attribute directives](https://angular.dev/guide/directives/attribute-directives)
- [Vercel + Angular](https://vercel.com/docs/frameworks/angular)
