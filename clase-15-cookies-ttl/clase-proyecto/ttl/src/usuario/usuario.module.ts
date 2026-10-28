import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { UsuarioService } from './usuario.service.js';
import { UsuarioController } from './usuario.controller.js';

@Module({
  imports: [CacheModule.register({ ttl: 5000 })],
  controllers: [UsuarioController],
  providers: [UsuarioService],
})
export class UsuarioModule {}
