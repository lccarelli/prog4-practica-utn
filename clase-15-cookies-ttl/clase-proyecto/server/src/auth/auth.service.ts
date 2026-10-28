import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  registro(body: LoginDto) {
    // Revisar que el usuario no exista
    // Revisar que la contraseña sea segura
    // Encriptar la contraseña para su guardado
    // Guardar el usuario en la DB
    return this.generarToken(body.user);
  }

  login(body: LoginDto) {
    // Revisar que el usuario exista y que coincida la contraseña encriptada
    return this.generarToken(body.user);
  }

  generarToken(user: string) {
    const fechaActual = Math.floor(Date.now() / 1000);

    const payload = {
      user,
      iat: fechaActual,
      exp: fechaActual + 60 * 15,
    };

    return jwt.sign(payload, process.env.CONTRASENA_DEL_SERVER ?? '', {
      issuer: 'MI SERVER',
    });
  }
}
