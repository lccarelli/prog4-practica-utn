import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('GET /app devuelve el query param page', () => {
    expect(appController.getHello('2')).toEqual({
      mensaje: 'Hello World!',
      page: '2',
    });
  });

  it('PUT /app/:id devuelve el id', () => {
    expect(appController.put('7')).toEqual({ mensaje: 'PUT: 7' });
  });
});
