import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

class Coords {
  @IsNumber()
  lat: number;

  @IsNumber()
  lon: number;
}

export class CreateCiudadDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  provincia: string;

  @ValidateNested()
  @Type(() => Coords)
  coords: Coords;
}
