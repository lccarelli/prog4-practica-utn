import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-episodios',
  imports: [ReactiveFormsModule],
  templateUrl: './episodios.html',
  styleUrl: './episodios.css',
})
export class Episodios {
  private fb = inject(FormBuilder);

  formulario = this.fb.array([new FormControl('')]);

  agregar() {
    this.formulario.push(new FormControl(''));
  }

  quitar() {
    this.formulario.removeAt(this.formulario.length - 1);
  }
}
