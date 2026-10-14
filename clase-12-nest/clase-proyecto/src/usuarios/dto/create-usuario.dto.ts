import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

// Va antes que CreateUsuarioDto: si no, "Cannot access 'Direccion' before initialization".
class Direccion {
  @IsString()
  @MinLength(1)
  calle: string;

  @IsNumber()
  @Min(1)
  numero: number;

  @IsOptional()
  @IsNumber()
  piso?: number;
}

export class CreateUsuarioDto {
  @IsString()
  @MinLength(3)
  @MaxLength(18)
  nombre: string;

  @IsString()
  @MinLength(3)
  @MaxLength(18)
  apellido: string;

  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'contraseña: 8 caracteres, una mayúscula y un número',
  })
  contraseña: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  roles: string[];

  @ValidateNested()
  @Type(() => Direccion)
  direccion: Direccion;

  @IsEmail()
  mail: string;
}
