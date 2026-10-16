import { PickType } from '@nestjs/mapped-types';
import { CreateMonumentoDto } from './create-monumento.dto.js';

// Cambiar de ciudad obligaría a sacarlo del array de la anterior; sólo se cambia el nombre.
export class UpdateMonumentoDto extends PickType(CreateMonumentoDto, [
  'nombre',
] as const) {}
