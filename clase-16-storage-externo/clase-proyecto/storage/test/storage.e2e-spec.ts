import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { v2 as cloudinary } from 'cloudinary';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

// 1x1 px en PNG.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

describe('Subida a Cloudinary (e2e)', () => {
  let app: INestApplication<App>;
  const upload = vi.spyOn(cloudinary.uploader, 'upload');

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(() => {
    upload.mockReset();
    upload.mockResolvedValue({
      secure_url:
        'https://res.cloudinary.com/demo/image/upload/clase-16/1-clase.png',
    } as never);
  });

  afterAll(async () => {
    await app.close();
  });

  it('manda la imagen como data URI y devuelve la URL', async () => {
    const res = await request(app.getHttpServer())
      .post('/')
      .attach('imagen', PNG, {
        filename: 'punto.png',
        contentType: 'image/png',
      })
      .expect(201);

    expect(res.body.url).toContain('res.cloudinary.com');
    const [uri, opciones] = upload.mock.calls[0];
    expect(uri.startsWith('data:image/png;base64,')).toBe(true);
    expect(opciones?.folder).toBe('clase-16');
  });

  it('más de 2 MB: 413 sin llamar a Cloudinary', async () => {
    await request(app.getHttpServer())
      .post('/')
      .attach('imagen', Buffer.alloc(1024 * 1024 * 2 + 1), {
        filename: 'grande.png',
        contentType: 'image/png',
      })
      .expect(413);
    expect(upload).not.toHaveBeenCalled();
  });

  it('sin archivo o si no es imagen: 400', async () => {
    await request(app.getHttpServer()).post('/').expect(400);
    await request(app.getHttpServer())
      .post('/')
      .attach('imagen', Buffer.from('hola'), {
        filename: 'a.txt',
        contentType: 'text/plain',
      })
      .expect(400);
    expect(upload).not.toHaveBeenCalled();
  });
});
