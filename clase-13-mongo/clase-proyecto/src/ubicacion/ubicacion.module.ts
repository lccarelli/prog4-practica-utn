import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CiudadController } from './ciudad/ciudad.controller.js';
import { CiudadService } from './ciudad/ciudad.service.js';
import { Ciudad, CiudadSchema } from './ciudad/entities/ciudad.entity.js';
import { MonumentoController } from './monumento/monumento.controller.js';
import { MonumentoService } from './monumento/monumento.service.js';
import {
  Monumento,
  MonumentoSchema,
} from './monumento/entities/monumento.entity.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ciudad.name, schema: CiudadSchema },
      { name: Monumento.name, schema: MonumentoSchema },
    ]),
  ],
  controllers: [CiudadController, MonumentoController],
  providers: [CiudadService, MonumentoService],
})
export class UbicacionModule {}
