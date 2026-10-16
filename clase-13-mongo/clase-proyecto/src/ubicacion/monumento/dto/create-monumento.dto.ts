import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateMonumentoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsMongoId()
  ciudadId: string;
}
