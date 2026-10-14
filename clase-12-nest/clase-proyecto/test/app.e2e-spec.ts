import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

const usuario = {
  nombre: 'Laura',
  apellido: 'Perez',
  contraseña: 'Secreta123',
  roles: ['usuario'],
  direccion: { calle: 'Mitre', numero: 750 },
  mail: 'laura@mail.com',
};

describe('Usuarios (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /usuarios con datos válidos devuelve 201', () => {
    return request(app.getHttpServer())
      .post('/usuarios')
      .send(usuario)
      .expect(201)
      .expect(usuario);
  });

  it('whitelist borra lo que no tiene decorador', async () => {
    const res = await request(app.getHttpServer())
      .post('/usuarios')
      .send({ ...usuario, esAdmin: true })
      .expect(201);
    expect(res.body.esAdmin).toBeUndefined();
  });

  it('mail inválido devuelve 400', () => {
    return request(app.getHttpServer())
      .post('/usuarios')
      .send({ ...usuario, mail: 'no-es-mail' })
      .expect(400);
  });

  it('valida el objeto anidado', () => {
    return request(app.getHttpServer())
      .post('/usuarios')
      .send({ ...usuario, direccion: { calle: 'Mitre', numero: 0 } })
      .expect(400);
  });

  it('roles vacío devuelve 400', () => {
    return request(app.getHttpServer())
      .post('/usuarios')
      .send({ ...usuario, roles: [] })
      .expect(400);
  });
});
