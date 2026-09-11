import { Component } from '@angular/core';
import {
  AsyncPipe,
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  PercentPipe,
  TitleCasePipe,
} from '@angular/common';
import { TextoLargoPipe } from '../pipes/texto-largo-pipe';
import { FechaPasadaPipe } from '../pipes/fecha-pasada-pipe';

@Component({
  selector: 'app-pipes-demo',
  imports: [
    AsyncPipe,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    PercentPipe,
    TitleCasePipe,
    TextoLargoPipe,
    FechaPasadaPipe,
  ],
  templateUrl: './pipes-demo.html',
  styleUrl: './pipes-demo.css',
})
export class PipesDemo {
  fecha = '2026-09-10T18:20:21.49Z';
  precio = 123456.789;
  porcentaje = 0.256;
  nombre = 'rick SÁNCHEZ';
  descripcion = 'Un científico genio, alcohólico y temerario que arrastra a su nieto a aventuras';

  saludo = new Promise<string>((resolve) => setTimeout(() => resolve('¡llegó la promesa!'), 2000));
}
