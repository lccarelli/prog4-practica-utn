# Clase 04 — Formularios y validaciones

**Fecha:** 27/08/2026 · **Angular:** 22.1.0

El video está subido como *"Clase 01 - Formularios"*, partes 1 y 2. El título
está mal: es la clase 04.

## Qué se dio

- Formularios reactivos: `FormControl` y `FormGroup`
- Grupos anidados
- `FormBuilder`
- Validadores de fábrica
- Validadores propios
- Mostrar errores en el template
- `FormArray`

---

## 1. Reactivo contra template-driven

Las dos formas de manejar un formulario:

```html
<!-- template-driven: el estado vive en el HTML -->
<input [(ngModel)]="nombre" />

<!-- reactivo: el estado vive en la clase -->
<input [formControl]="nombre" />
```

Con `ngModel` el formulario es una propiedad suelta. Con `FormControl` es un
objeto con valor, estado de validación, `touched`, `dirty` y un observable de
cambios — todo accesible desde TypeScript, o sea testeable.

Para un input suelto `ngModel` alcanza. Para cualquier cosa con validaciones,
reactivo.

Requiere `ReactiveFormsModule` en los `imports` del componente. Sin eso,
`[formControl]` no lo reconoce nadie y el input queda inerte, sin error claro.

## 2. FormGroup y FormControl

```typescript
formulario = new FormGroup({
  nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
  email: new FormControl('', Validators.email),
});
```

El primer argumento es el valor inicial; el segundo, los validadores.

```html
<form [formGroup]="formulario" (ngSubmit)="enviar()">
  <input formControlName="nombre" />
  <button type="submit">Enviar</button>
</form>
```

Tres piezas que se corresponden: `[formGroup]` en el `<form>`,
`formControlName` en cada input con el nombre de la clave, y `(ngSubmit)` en el
formulario — **no** un `(click)` en el botón, así también funciona el Enter.

### Grupos anidados

```typescript
formulario = new FormGroup({
  nombre: new FormControl(''),
  direccion: new FormGroup({
    calle: new FormControl(''),
    numero: new FormControl(''),
  }),
});
```

```html
<div formGroupName="direccion">
  <input formControlName="calle" />
  <input formControlName="numero" />
</div>
```

El valor sale anidado igual que la estructura. Sirve para agrupar lo que
conceptualmente va junto, y para validar el conjunto.

## 3. FormBuilder

La misma estructura, menos ceremonia:

```typescript
formBuilder = inject(FormBuilder);

formulario = this.formBuilder.group({
  nombre: ['', [Validators.required, Validators.minLength(3)]],
  direccion: this.formBuilder.group({
    calle: ['', [Validators.required]],
  }),
});
```

**El atajo del array tiene tres posiciones:**

```
[valorInicial, validadoresSincronicos, validadoresAsincronicos]
```

La tercera es la trampa. Poner un validador común ahí lo convierte en
asincrónico: Angular espera una promesa u observable, recibe un objeto, y el
control puede quedarse en `PENDING` para siempre. En el ejemplo de la cátedra
hay uno así:

```typescript
// el pattern quedó como validador asincrónico
numero: [null, [Validators.required, this.largoExacto(16)], Validators.pattern(/^[0-9]/)],
```

Va adentro del segundo array.

### Getters para el template

```typescript
get nombre() {
  return this.formulario.get('nombre');
}
get calle() {
  return this.formulario.get('direccion.calle');
}
```

Para anidados, `get('direccion.calle')` con punto.

## 4. Validadores de fábrica

`required`, `minLength`, `maxLength`, `min`, `max`, `email`, `pattern`.

### `Validators.email` es más permisivo de lo que parece

Extrayendo su expresión regular del propio paquete y probándola:

| Entrada | Resultado |
| --- | --- |
| `laura@gmail.com` | acepta |
| `a@b` | **acepta** |
| `laura@gmail.c` | **acepta** |
| `sin-arroba.com` | rechaza |
| `laura@gmail..com` | rechaza |
| `laura @gmail.com` | rechaza |

**No exige dominio.** Si querés algo que parezca una dirección real, hace falta
sumarle un validador propio.

### `Validators.pattern` no se ancla solo

```typescript
Validators.pattern(/^[0-9]/); // sólo exige que EMPIECE con un dígito
```

Con esa expresión pasan `1abc`, `9!!!` y `5.5.5.5`. Lo correcto es `/^[0-9]+$/`.

La diferencia está en el tipo del argumento: si le pasás un **string**, Angular
le agrega `^` y `$`; si le pasás un **RegExp**, lo usa tal cual.

### `maxLength` no sirve para números

Mira `value.length`, y un número no tiene `length`. En un control numérico el
validador no hace nada — pasa siempre. Para acotar un número van `min` y `max`.

## 5. Validadores propios

Un validador es una función que recibe el control y devuelve **`null` si está
todo bien**, o un objeto si falla. Lo contraintuitivo es que el éxito sea el
vacío.

```typescript
export function entero(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === '') return null;
    return Number.isInteger(Number(control.value)) ? null : { entero: true };
  };
}
```

Tres decisiones ahí:

- **Es una fábrica**: `entero()` devuelve el validador. Así se puede
  parametrizar, como `largoExacto(16)`.
- **Deja pasar el vacío.** De eso se ocupa `required`. Si no, un campo opcional
  vacío queda inválido para siempre.
- **La clave del objeto** (`entero`) es la que después busca el template para
  mostrar el mensaje. Conviene que el valor lleve el dato que el mensaje
  necesita: `{ largoExacto: 16 }` es más útil que `{ largoExacto: true }`.

### Validador de grupo

Si la regla cruza dos campos, no puede vivir en un control: ninguno ve al otro.
Va en el `FormGroup`.

```typescript
export function notaLargaSiEsPerfecto(grupo: AbstractControl): ValidationErrors | null {
  const puntaje = grupo.get('puntaje')?.value;
  const nota = grupo.get('nota')?.value ?? '';

  if (Number(puntaje) !== 5) return null;
  return nota.length >= 30 ? null : { notaCorta: { requerido: 30, actual: nota.length } };
}
```

Se registra como segundo argumento del `group()`:

```typescript
this.formBuilder.group({ ... }, { validators: [notaLargaSiEsPerfecto] });
```

El error aparece en `formulario.errors`, no en el de ningún campo. Es el caso
típico de "repetir contraseña" o "fecha desde / fecha hasta".

## 6. Mostrar los errores

```html
@if (nombre?.errors?.['required'] && nombre.touched) {
  <small>El nombre es requerido</small>
}
```

**`touched` es lo que evita gritarle al usuario antes de que escriba nada.** Se
pone en `true` cuando el campo pierde el foco.

Ojo con las claves: `minlength` y `maxlength` van **en minúscula**, aunque los
validadores se llamen `minLength` y `maxLength`. Hace perder un rato largo.

El objeto de error trae datos útiles:

```html
{{ nombre?.errors?.['minlength'].requiredLength }}
```

### El agujero: enviar sin tocar nada

Si alguien abre el formulario y aprieta Enviar directo, **no ve ni un error**:
los mensajes dependen de `touched`, y nada está tocado.

```typescript
enviar() {
  if (this.formulario.invalid) {
    this.formulario.markAllAsTouched();
    return;
  }
  // ...
}
```

Probado: `markAllAsTouched()` emite en `control.events` y llega a los hijos.
`statusChanges` **no** avisa de cambios de `touched`, sólo de validez — dato
importante si alguna vez te suscribís a mano.

## 7. El patrón para no repetir mensajes

Con quince campos, un `@if` por error por campo son cincuenta bloques. Hay dos
salidas, y la cátedra tomó la primera.

### Un componente por tipo de error

```typescript
@Component({ selector: 'app-error-required', ... })
export class ErrorRequired {
  errors = input<any>();
  mensaje = input<string | null>();
}
```

```html
@if (errors()?.['required']) {
  <p>{{ mensaje() || 'El campo es requerido' }}</p>
}
```

Se usan componiendo, con el `mensaje` opcional para pisar el texto por defecto:

```html
<app-campo-input [control]="formulario.controls.nombre" label="Nombre">
  <app-error-required [errors]="formulario.controls.nombre.errors" />
  <app-error-min-length [errors]="formulario.controls.nombre.errors" />
</app-campo-input>
```

El `campo-input` envuelve label e input, y proyecta los errores con
`<ng-content />` adentro de un `@if (control()?.touched)`. Así el chequeo de
`touched` queda en un solo lugar.

**A favor:** cada error es explícito en el template, y se elige cuáles mostrar
por campo. **En contra:** hay que declarar e importar un componente por error, y
recordar cuáles corresponden a cada campo.

### Un componente con catálogo de mensajes

La alternativa: un mapa de clave de error a mensaje, y un solo componente.

```typescript
const MENSAJES: Record<string, (d: any) => string> = {
  required: () => 'Este campo es obligatorio.',
  minlength: (d) => `Necesita al menos ${d.requiredLength} caracteres.`,
  entero: () => 'Tiene que ser un número entero.',
};
```

```html
<app-errores [control]="nombre" />
```

**A favor:** un componente y un archivo de textos; agregar un validador nuevo es
agregar una línea. **En contra:** el template no dice qué errores puede tener el
campo, y hay que definir una prioridad para cuándo hay varios a la vez.

Ninguna es mejor en abstracto. La primera se lee mejor en formularios chicos con
mensajes muy a medida; la segunda escala mejor cuando los textos se repiten.

### Un detalle de detección de cambios

Si el componente de errores lee `control.errors` con un getter, el getter se
reevalúa en cada ciclo de detección — y como estos componentes usan la estrategia
por defecto, alcanza. Pero si lo pasás a `OnPush`, **la referencia del control
nunca cambia** y el componente no se entera. Ahí hay que suscribirse a
`control.events`, que sí avisa de valor, estado y `touched`.

## 8. FormArray

Para campos que se agregan y se quitan.

```typescript
formulario = this.formBuilder.array([new FormControl('')]);

agregar() {
  this.formulario.push(new FormControl(''));
}
quitar() {
  this.formulario.removeAt(this.formulario.length - 1);
}
```

```html
<form [formArray]="formulario">
  @for (item of formulario.controls; track $index; let i = $index) {
    <input [formControlName]="i" />
  }
</form>
```

En un array el `formControlName` es el **índice**, no un nombre. Y `[formArray]`
existe como directiva desde hace poco; antes había que envolverlo en un
`FormGroup` y usar `formArrayName`.

---

## Cosas que confunden

| Síntoma | Causa |
| ------- | ----- |
| El input no responde y no hay error | Falta `ReactiveFormsModule` en los `imports` |
| El control queda en `PENDING` para siempre | Un validador común quedó en la tercera posición del atajo, que es la de asincrónicos |
| El mensaje de `minLength` nunca aparece | La clave es `minlength`, todo en minúscula |
| `maxLength` no valida nada | El control es numérico y `maxLength` mira `value.length` |
| `pattern` acepta basura | Se pasó un RegExp sin anclar con `$` |
| `Validators.email` acepta `a@b` | Es correcto: no exige dominio. Hace falta un validador propio |
| Envío vacío y no se ve ningún error | Falta `markAllAsTouched()` en el submit |
| El validador propio deja inválido un campo opcional | No devuelve `null` cuando el valor está vacío |
| No encuentro dónde poner una regla que cruza dos campos | Va en el `FormGroup`, no en un control |
| El error del grupo no aparece | Se busca en `formulario.errors`, no en el de un campo |

## Referencia rápida

```typescript
// Estructura
formulario = this.fb.group(
  {
    campo: ['', [Validators.required, Validators.minLength(3)]],
    grupo: this.fb.group({ hijo: [''] }),
  },
  { validators: [validadorDeGrupo] },
);

// Validador propio
export function regla(parametro: number): ValidatorFn {
  return (control) => (condicion ? null : { regla: parametro });
}

// Acceso
this.formulario.get('campo');
this.formulario.get('grupo.hijo');
this.formulario.valid;
this.formulario.markAllAsTouched();
```

```html
<form [formGroup]="formulario" (ngSubmit)="enviar()">
  <input formControlName="campo" />
  <div formGroupName="grupo"><input formControlName="hijo" /></div>
</form>

@if (campo?.touched && campo?.errors?.['required']) { ... }
```

## Links

- [Formularios](https://angular.dev/guide/forms)
- [Formularios reactivos](https://angular.dev/guide/forms/reactive-forms)
- [Validaciones](https://angular.dev/guide/forms/form-validation)
- [Validaciones propias](https://angular.dev/guide/forms/form-validation#defining-custom-validators)
