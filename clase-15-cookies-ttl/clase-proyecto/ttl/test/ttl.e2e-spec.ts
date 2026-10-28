import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { ProductoService } from './../src/producto/producto.service.js';

describe('Throttler, caché y lazy loading (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('la cuarta petición en un segundo devuelve 429', async () => {
    const server = app.getHttpServer();
    for (let i = 0; i < 3; i++) {
      await request(server).get('/').expect(200);
    }
    await request(server).get('/').expect(429);
  });

  it('la segunda lectura sale del caché', async () => {
    const server = app.getHttpServer();
    const primera = await request(server).get('/usuario').expect(200);
    const segunda = await request(server).get('/usuario').expect(200);
    expect(segunda.body).toEqual(primera.body);
  });

  it('ProductoModule no existe hasta la primera petición a /mueble', async () => {
    expect(() => app.get(ProductoService)).toThrow();

    const res = await request(app.getHttpServer()).get('/mueble').expect(200);
    expect(res.text).toBe('ProductoService cargado recién ahora');
  });
});
