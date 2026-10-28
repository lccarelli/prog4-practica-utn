import { Module } from '@nestjs/common';
import { ProductoService } from './producto.service.js';

// Un módulo lazy no puede tener controllers: las rutas se registran al arrancar.
@Module({
  providers: [ProductoService],
})
export class ProductoModule {}
