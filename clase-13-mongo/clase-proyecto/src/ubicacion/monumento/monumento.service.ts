import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ciudad } from '../ciudad/entities/ciudad.entity.js';
import { CreateMonumentoDto } from './dto/create-monumento.dto.js';
import { UpdateMonumentoDto } from './dto/update-monumento.dto.js';
import { Monumento } from './entities/monumento.entity.js';

@Injectable()
export class MonumentoService {
  constructor(
    @InjectModel(Monumento.name) private monumentoModel: Model<Monumento>,
    @InjectModel(Ciudad.name) private ciudadModel: Model<Ciudad>,
  ) {}

  async create(createMonumentoDto: CreateMonumentoDto) {
    const ciudad = await this.ciudadModel.findById(createMonumentoDto.ciudadId);
    if (!ciudad) {
      throw new NotFoundException('La ciudad no existe');
    }

    const monumento = new this.monumentoModel({
      nombre: createMonumentoDto.nombre,
      ciudad: new Types.ObjectId(createMonumentoDto.ciudadId),
    });

    ciudad.monumentos.push(monumento._id);
    await ciudad.save();
    return await monumento.save();
  }

  async findAll() {
    return await this.monumentoModel.find();
  }

  async findOne(id: string) {
    return await this.monumentoModel.findById(id);
  }

  async update(id: string, updateMonumentoDto: UpdateMonumentoDto) {
    return await this.monumentoModel.findByIdAndUpdate(id, updateMonumentoDto, {
      returnDocument: 'after',
    });
  }

  async remove(id: string) {
    const monumento = await this.monumentoModel.findByIdAndDelete(id);
    if (!monumento) {
      return null;
    }

    const ciudad = await this.ciudadModel.findById(monumento.ciudad);
    if (ciudad) {
      ciudad.monumentos = ciudad.monumentos.filter(
        (m) => !m.equals(monumento._id),
      );
      await ciudad.save();
    }
    return monumento;
  }
}
