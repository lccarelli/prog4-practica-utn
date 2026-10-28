import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { MuebleModule } from './mueble/mueble.module.js';
import { UsuarioModule } from './usuario/usuario.module.js';

// ProductoModule no se importa: se carga lazy desde MuebleService.
@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 3 }, // ttl: Time To Live, en ms
      { name: 'medium', ttl: 10000, limit: 20 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),
    UsuarioModule,
    MuebleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Sin esto el throttler cuenta pero no bloquea. Equivale a @UseGuards en todas las rutas.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
