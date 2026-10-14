import { OmitType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto.js';

// Otras opciones vistas en clase:
// export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {}
// export class UpdateUsuarioDto extends PickType(CreateUsuarioDto, ['nombre', 'apellido'] as const) {}
export class UpdateUsuarioDto extends OmitType(CreateUsuarioDto, [
  'mail',
  'contraseña',
] as const) {}
