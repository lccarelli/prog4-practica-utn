import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import jwt from 'jsonwebtoken';

@Injectable()
export class TokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req: Request = context.switchToHttp().getRequest();
    // Primero la cookie; si no hay, el header de la clase 14.
    const token =
      req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('Falta el token');
    }

    try {
      jwt.verify(token, process.env.CONTRASENA_DEL_SERVER ?? '');
      return true;
    } catch {
      throw new UnauthorizedException('Token no válido');
    }
  }
}
