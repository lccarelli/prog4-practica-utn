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
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('Falta el token');
    }

    try {
      const payload = jwt.verify(
        token,
        process.env.CONTRASENA_DEL_SERVER ?? '',
      );
      req.body = { ...req.body, user: (payload as { user: string }).user };
      return true;
    } catch {
      throw new UnauthorizedException('Token no válido');
    }
  }
}
