import { Body, Controller, Post, Res } from '@nestjs/common';
import type { CookieOptions, Response } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';

// Front y back en dominios distintos: sameSite 'none', que exige secure.
const opcionesCookie = (): CookieOptions => ({
  httpOnly: true,
  sameSite: 'none',
  secure: true,
  expires: new Date(Date.now() + 1000 * 60 * 15),
});

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  registro(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = this.authService.registro(body);
    response.cookie('token', token, opcionesCookie());
    return { token };
  }

  @Post('login')
  login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = this.authService.login(body);
    response.cookie('token', token, opcionesCookie());
    return { token };
  }
}
