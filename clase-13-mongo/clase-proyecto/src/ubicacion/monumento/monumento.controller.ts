import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateMonumentoDto } from './dto/create-monumento.dto.js';
import { UpdateMonumentoDto } from './dto/update-monumento.dto.js';
import { MonumentoService } from './monumento.service.js';

@Controller('monumento')
export class MonumentoController {
  constructor(private readonly monumentoService: MonumentoService) {}

  @Post()
  create(@Body() createMonumentoDto: CreateMonumentoDto) {
    return this.monumentoService.create(createMonumentoDto);
  }

  @Get()
  findAll() {
    return this.monumentoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.monumentoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMonumentoDto: UpdateMonumentoDto,
  ) {
    return this.monumentoService.update(id, updateMonumentoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.monumentoService.remove(id);
  }
}
