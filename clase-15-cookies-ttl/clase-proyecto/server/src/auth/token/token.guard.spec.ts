import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { TokenGuard } from './token.guard.js';

const contexto = (req: object) =>
  ({
    switchToHttp: () => ({ getRequest: () => req }),
  }) as ExecutionContext;

describe('TokenGuard', () => {
  const guard = new TokenGuard();
  process.env.CONTRASENA_DEL_SERVER = 'clave-de-prueba';

  it('deja pasar con un token válido en la cookie', () => {
    const token = jwt.sign({ user: 'laura' }, 'clave-de-prueba');
    expect(
      guard.canActivate(contexto({ cookies: { token }, headers: {} })),
    ).toBe(true);
  });

  it('rechaza un token firmado con otra clave', () => {
    const token = jwt.sign({ user: 'laura' }, 'otra-clave');
    expect(() =>
      guard.canActivate(contexto({ cookies: { token }, headers: {} })),
    ).toThrow(UnauthorizedException);
  });

  it('sin cookie-parser (req.cookies undefined) no explota: 401', () => {
    expect(() => guard.canActivate(contexto({ headers: {} }))).toThrow(
      UnauthorizedException,
    );
  });
});
