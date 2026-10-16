import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCiudadDto } from './dto/create-ciudad.dto.js';
import { UpdateCiudadDto } from './dto/update-ciudad.dto.js';
import { Ciudad } from './entities/ciudad.entity.js';

@Injectable()
export class CiudadService {
  constructor(@InjectModel(Ciudad.name) private ciudadModel: Model<Ciudad>) {}

  async create(createCiudadDto: CreateCiudadDto) {
    const ciudad = new this.ciudadModel(createCiudadDto);
    return await ciudad.save();
  }

  async findAll() {
    return await this.ciudadModel.find();
  }

  async findOne(id: string) {
    return await this.ciudadModel.findById(id);
  }

  async update(id: string, updateCiudadDto: UpdateCiudadDto) {
    return await this.ciudadModel.findByIdAndUpdate(id, updateCiudadDto, {
      returnDocument: 'after',
    });
  }

  async remove(id: string) {
    return await this.ciudadModel.findByIdAndDelete(id);
  }
}
