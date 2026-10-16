import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';

// Necesita el Mongo local corriendo (ver README).
describe('Ciudad y monumento (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('crea un monumento y queda referenciado en la ciudad', async () => {
    const ciudad = await request(app.getHttpServer())
      .post('/ciudad')
      .send({
        nombre: 'Avellaneda',
        provincia: 'Buenos Aires',
        coords: { lat: -34.66, lon: -58.36 },
      })
      .expect(201);

    const monumento = await request(app.getHttpServer())
      .post('/monumento')
      .send({ nombre: 'Puente', ciudadId: ciudad.body._id })
      .expect(201);
    expect(monumento.body.ciudad).toBe(ciudad.body._id);

    const actualizada = await request(app.getHttpServer())
      .get(`/ciudad/${ciudad.body._id}`)
      .expect(200);
    expect(actualizada.body.monumentos).toEqual([monumento.body._id]);

    await request(app.getHttpServer())
      .delete(`/monumento/${monumento.body._id}`)
      .expect(200);
    const sinMonumento = await request(app.getHttpServer()).get(
      `/ciudad/${ciudad.body._id}`,
    );
    expect(sinMonumento.body.monumentos).toEqual([]);

    await request(app.getHttpServer())
      .delete(`/ciudad/${ciudad.body._id}`)
      .expect(200);
  });

  it('PATCH devuelve el documento nuevo', async () => {
    const ciudad = await request(app.getHttpServer())
      .post('/ciudad')
      .send({
        nombre: 'Lanus',
        provincia: 'Buenos Aires',
        coords: { lat: -34.7, lon: -58.39 },
      });

    const res = await request(app.getHttpServer())
      .patch(`/ciudad/${ciudad.body._id}`)
      .send({ nombre: 'Lanús' })
      .expect(200);
    expect(res.body.nombre).toBe('Lanús');

    await request(app.getHttpServer()).delete(`/ciudad/${ciudad.body._id}`);
  });

  it('monumento con una ciudad inexistente devuelve 404', () => {
    return request(app.getHttpServer())
      .post('/monumento')
      .send({ nombre: 'Nada', ciudadId: '000000000000000000000000' })
      .expect(404);
  });

  it('ciudadId que no es un ObjectId devuelve 400', () => {
    return request(app.getHttpServer())
      .post('/monumento')
      .send({ nombre: 'Nada', ciudadId: '123' })
      .expect(400);
  });
});
