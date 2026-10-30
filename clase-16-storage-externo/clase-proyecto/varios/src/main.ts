import { ConsoleLogger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'Clase16',
      timestamp: true,
    }),
  });
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
