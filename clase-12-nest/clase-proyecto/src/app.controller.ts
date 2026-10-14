import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Query('page') page?: string) {
    return { mensaje: this.appService.getHello(), page };
  }

  @Post()
  @HttpCode(201)
  post() {
    return { mensaje: 'POST' };
  }

  @Post('otro')
  postOtro() {
    return { mensaje: 'OTRO POST' };
  }

  @Put(':id')
  put(@Param('id') id: string) {
    return { mensaje: 'PUT: ' + id };
  }

  @Delete()
  delete() {
    return { mensaje: 'DELETE' };
  }
}
