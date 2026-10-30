import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger('LoggingInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request: Request = context.switchToHttp().getRequest();
    const inicio = Date.now();
    this.logger.log(`Antes: ${request.method} ${request.url}`);

    return next
      .handle()
      .pipe(tap(() => this.logger.log(`Después: ${Date.now() - inicio} ms`)));
  }
}
