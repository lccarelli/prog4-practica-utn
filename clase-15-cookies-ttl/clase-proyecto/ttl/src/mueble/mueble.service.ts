import { Injectable } from '@nestjs/common';
import { LazyModuleLoader } from '@nestjs/core';
import { CreateMuebleDto } from './dto/create-mueble.dto.js';
import { UpdateMuebleDto } from './dto/update-mueble.dto.js';

@Injectable()
export class MuebleService {
  constructor(private lazyModuleLoader: LazyModuleLoader) {}

  create(createMuebleDto: CreateMuebleDto) {
    return 'This action adds a new mueble';
  }

  async findAll() {
    const { ProductoModule } = await import('../producto/producto.module.js');
    const moduloCargado = await this.lazyModuleLoader.load(
      () => ProductoModule,
    );

    const { ProductoService } = await import('../producto/producto.service.js');
    return moduloCargado.get(ProductoService).algo();
  }

  findOne(id: number) {
    return `This action returns a #${id} mueble`;
  }

  update(id: number, updateMuebleDto: UpdateMuebleDto) {
    return `This action updates a #${id} mueble`;
  }

  remove(id: number) {
    return `This action removes a #${id} mueble`;
  }
}
