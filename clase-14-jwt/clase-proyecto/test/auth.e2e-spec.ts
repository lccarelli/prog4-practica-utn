import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('JWT (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    const res = await request(app.getHttpServer())
      .post('/auth/registro')
      .send({ user: 'laura', pass: '1234' })
      .expect(201);
    token = res.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('el payload se puede leer sin la clave: no va nada sensible', () => {
    const payload = jwt.decode(token) as jwt.JwtPayload;
    expect(payload.user).toBe('laura');
    expect(payload.iss).toBe('MI SERVER');
    expect(payload.exp! - payload.iat!).toBe(60 * 15);
  });

  it('sin token devuelve 401', () => {
    return request(app.getHttpServer()).get('/dibujo').expect(401);
  });

  it('con token pasa y el controller recibe el usuario', () => {
    return request(app.getHttpServer())
      .get('/dibujo')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Dibujos de laura');
  });

  it('un token modificado devuelve 401', () => {
    const [encabezado, , firma] = token.split('.');
    const payloadFalso = Buffer.from(
      JSON.stringify({ user: 'admin' }),
    ).toString('base64url');

    return request(app.getHttpServer())
      .get('/dibujo')
      .set('Authorization', `Bearer ${encabezado}.${payloadFalso}.${firma}`)
      .expect(401);
  });

  it('un token vencido devuelve 401', () => {
    const vencido = jwt.sign(
      { user: 'laura', exp: Math.floor(Date.now() / 1000) - 1 },
      process.env.CONTRASENA_DEL_SERVER ?? '',
    );

    return request(app.getHttpServer())
      .get('/dibujo')
      .set('Authorization', `Bearer ${vencido}`)
      .expect(401);
  });

  it('el login además deja el token en una cookie httpOnly', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ user: 'laura', pass: '1234' })
      .expect(201);

    const cookie = String(res.headers['set-cookie']);
    expect(cookie).toContain('token=');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Strict');
  });

  it('el registro sin pass devuelve 400', () => {
    return request(app.getHttpServer())
      .post('/auth/registro')
      .send({ user: 'laura' })
      .expect(400);
  });
});
