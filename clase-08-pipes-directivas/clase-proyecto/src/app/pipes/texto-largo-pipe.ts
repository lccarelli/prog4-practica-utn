import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textoLargo',
})
export class TextoLargoPipe implements PipeTransform {
  transform(value: string, largoMaximo: number = 15): string {
    if (value.length > largoMaximo) {
      return value.slice(0, largoMaximo) + '...';
    }
    return value;
  }
}
