import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Storage } from '../services/storage';
import { Db } from '../services/db';
import { Imagen } from '../interfaces/imagen';

@Component({
  selector: 'app-galeria',
  imports: [ReactiveFormsModule],
  templateUrl: './galeria.html',
  styleUrl: './galeria.css',
})
export class Galeria implements OnInit {
  storage = inject(Storage);
  private db = inject(Db);

  imagenes = signal<Imagen[]>([]);
  error = signal<string | null>(null);

  formulario = new FormGroup({
    foto: new FormControl<File | null>(null, Validators.required),
  });

  async ngOnInit() {
    this.imagenes.set(await this.db.traerImagenes());
  }

  cargarImagen(event: Event) {
    const elemento = event.target as HTMLInputElement;
    if (elemento.files) {
      this.formulario.controls.foto.setValue(elemento.files[0]);
    }
  }

  async subir() {
    const foto = this.formulario.value.foto;
    if (!foto) return;

    const ruta = await this.storage.subir(foto);
    if (!ruta) {
      this.error.set('No se pudo subir la imagen.');
      return;
    }

    await this.db.guardarRuta(ruta);
    this.error.set(null);
    this.imagenes.set(await this.db.traerImagenes());
  }

  async eliminar(imagen: Imagen) {
    await this.storage.eliminar(imagen.ruta);
    await this.db.eliminar(imagen.id);
    this.imagenes.set(await this.db.traerImagenes());
  }
}
