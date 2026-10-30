import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service.js';
import { LoggingInterceptor } from './interceptors/logging/logging.interceptor.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseInterceptors(LoggingInterceptor)
  getHello(): string {
    return this.appService.getHello();
  }
}
