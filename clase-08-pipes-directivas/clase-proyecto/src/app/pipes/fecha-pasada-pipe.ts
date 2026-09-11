import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaPasada',
})
export class FechaPasadaPipe implements PipeTransform {
  transform(value: string): string {
    const minutos = Math.floor((Date.now() - Date.parse(value)) / 60000);

    if (minutos < 1) return 'recién';
    if (minutos < 60) return `hace ${minutos} min`;

    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `hace ${horas} h`;

    const dias = Math.floor(horas / 24);
    return dias === 1 ? 'hace 1 día' : `hace ${dias} días`;
  }
}
