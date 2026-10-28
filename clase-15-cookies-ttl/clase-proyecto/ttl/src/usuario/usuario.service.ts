import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';

@Injectable()
export class UsuarioService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  create(createUsuarioDto: CreateUsuarioDto) {
    return 'This action adds a new usuario';
  }

  async findAll() {
    const usuariosGuardados = await this.cacheManager.get('usuarios');
    if (usuariosGuardados) {
      return usuariosGuardados;
    }

    // Acá iría la consulta a la base, que es lo que más cuesta.
    const usuarios = [
      { nombre: 'agus' },
      { nombre: 'Nat' },
      { nombre: 'Daniel' },
    ];
    await this.cacheManager.set('usuarios', usuarios);
    return usuarios;
  }

  findOne(id: number) {
    return `This action returns a #${id} usuario`;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    // Invalidar por evento: si algo cambia, la próxima lectura vuelve a la base.
    await this.cacheManager.del('usuarios');
    return `This action updates a #${id} usuario`;
  }

  remove(id: number) {
    return `This action removes a #${id} usuario`;
  }
}
