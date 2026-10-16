import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { Ciudad } from '../ciudad/entities/ciudad.entity.js';
import { Monumento } from './entities/monumento.entity.js';
import { MonumentoService } from './monumento.service.js';

describe('MonumentoService', () => {
  let service: MonumentoService;
  let ciudad: { monumentos: Types.ObjectId[]; save: ReturnType<typeof vi.fn> };

  // El modelo es una clase: new monumentoModel({...}) tiene que andar.
  class MonumentoModelFalso {
    _id = new Types.ObjectId();
    constructor(public datos: object) {}
    save = vi.fn(async () => this);
  }

  const ciudadModel = { findById: vi.fn() };

  beforeEach(async () => {
    ciudad = { monumentos: [], save: vi.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonumentoService,
        {
          provide: getModelToken(Monumento.name),
          useValue: MonumentoModelFalso,
        },
        { provide: getModelToken(Ciudad.name), useValue: ciudadModel },
      ],
    }).compile();

    service = module.get(MonumentoService);
  });

  it('si la ciudad no existe, no crea nada', async () => {
    ciudadModel.findById.mockResolvedValue(null);
    const ciudadId = new Types.ObjectId().toString();

    await expect(
      service.create({ nombre: 'Obelisco', ciudadId }),
    ).rejects.toThrow(NotFoundException);
  });

  it('guarda el id del monumento en la ciudad', async () => {
    ciudadModel.findById.mockResolvedValue(ciudad);
    const ciudadId = new Types.ObjectId().toString();

    const monumento = await service.create({ nombre: 'Obelisco', ciudadId });

    expect(ciudad.monumentos).toEqual([monumento._id]);
    expect(ciudad.save).toHaveBeenCalled();
  });
});
