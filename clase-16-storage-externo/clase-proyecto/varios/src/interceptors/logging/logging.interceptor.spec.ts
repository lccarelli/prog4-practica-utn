import { CallHandler, ExecutionContext, Logger } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor.js';

describe('LoggingInterceptor', () => {
  it('loguea antes y después del método, y no toca la respuesta', async () => {
    const log = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    const contexto = {
      switchToHttp: () => ({ getRequest: () => ({ method: 'GET', url: '/' }) }),
    } as ExecutionContext;
    const next: CallHandler = { handle: () => of('Hello World!') };

    const respuesta = await lastValueFrom(
      new LoggingInterceptor().intercept(contexto, next),
    );

    expect(respuesta).toBe('Hello World!');
    expect(log.mock.calls.map(([m]) => m)).toEqual([
      'Antes: GET /',
      expect.stringMatching(/^Después: \d+ ms$/),
    ]);
  });
});
