import { INestApplication } from '@nestjs/common';
import { DiskHealthIndicator, HttpHealthIndicator } from '@nestjs/terminus';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('Health (e2e)', () => {
  let app: INestApplication<App>;
  const ping = vi.fn();

  beforeAll(async () => {
    // Internet y el disco dependen de la máquina: en el test se simulan.
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HttpHealthIndicator)
      .useValue({ pingCheck: ping })
      .overrideProvider(DiskHealthIndicator)
      .useValue({ checkStorage: async () => ({ disco: { status: 'up' } }) })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health responde 200 si todo está bien', async () => {
    ping.mockResolvedValue({ google: { status: 'up' } });
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.details.memoria.status).toBe('up');
  });

  it('/health responde 503 si un chequeo falla', async () => {
    ping.mockResolvedValue({ google: { status: 'down' } });
    const res = await request(app.getHttpServer()).get('/health').expect(503);
    expect(res.body.status).toBe('error');
  });
});
