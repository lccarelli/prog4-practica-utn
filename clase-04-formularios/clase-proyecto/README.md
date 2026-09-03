# Clase 04 — Formularios y validaciones · proyecto

El apunte de la clase está en [`../clase-apunte/apunte.md`](../clase-apunte/apunte.md).

```bash
nvm use
npm ci
npm start        # http://localhost:4200
```

Parte de la clase 03 (el catálogo de Rick and Morty, con Tailwind) y suma dos páginas de formularios.

## Estructura

```
src/app/
├── app.routes.ts              '', '/formulario' y '/episodios'
├── validadores/
│   ├── validadores.ts         entero, dominioConPunto, sinEspacios y uno de grupo
│   └── mensajes.ts            Catálogo de mensajes por clave de error
├── componentes/errores/       Recibe el objeto errors y muestra el primer mensaje
└── pages/
    ├── catalogo/              Lo de la clase 03
    ├── formulario/            FormBuilder, grupo anidado, validadores propios y de grupo
    └── episodios/             FormArray: agregar y quitar campos
```

## Qué mirar

- **`formulario.ts`**: `fb.group` con un grupo anidado (`visto`) y un validador de grupo (`notaLargaSiEsPerfecto`) que cruza dos campos. Los getters existen sólo para que el template quede corto.
- **`enviar()`**: `markAllAsTouched()` cuando es inválido. Sin eso, enviar el formulario sin tocar nada no muestra ningún error.
- **`validadores.ts`**: todos devuelven `null` con el campo vacío. Del vacío se ocupa `Validators.required`.
- **`episodios/`**: `[formArray]` en la raíz y `[formControlName]="i"`, con el índice como nombre.
