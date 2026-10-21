import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { DibujoModule } from './dibujo/dibujo.module.js';

@Module({
  imports: [ConfigModule.forRoot(), DibujoModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
