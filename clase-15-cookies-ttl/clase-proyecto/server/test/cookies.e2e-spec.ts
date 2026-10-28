import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('Cookies y CORS (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // Lo mismo que main.ts.
    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.enableCors({ origin: 'http://localhost:4200', credentials: true });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('el registro deja una cookie httpOnly, secure y SameSite=None', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/registro')
      .send({ user: 'laura', pass: '1234' })
      .expect(201);

    const cookie = String(res.headers['set-cookie']);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Secure');
    expect(cookie).toContain('SameSite=None');
  });

  it('el guard lee el token de la cookie', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ user: 'laura', pass: '1234' });
    // Como hace el navegador: devuelve sólo nombre=valor, sin los atributos.
    const cookie = String(login.headers['set-cookie']).split(';')[0];

    await request(app.getHttpServer())
      .get('/dibujo')
      .set('Cookie', cookie)
      .expect(200, {
        mensaje: 'This action returns all dibujo',
      });
  });

  it('sin cookie ni header devuelve 401', () => {
    return request(app.getHttpServer()).get('/dibujo').expect(401);
  });

  it('también acepta el header de la clase 14', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ user: 'laura', pass: '1234' });

    await request(app.getHttpServer())
      .get('/dibujo')
      .set('Authorization', `Bearer ${res.body.token}`)
      .expect(200);
  });

  it('CORS responde con el origin del front y credentials', async () => {
    const res = await request(app.getHttpServer())
      .options('/auth/login')
      .set('Origin', 'http://localhost:4200')
      .set('Access-Control-Request-Method', 'POST')
      .expect(204);

    expect(res.headers['access-control-allow-origin']).toBe(
      'http://localhost:4200',
    );
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });
});
