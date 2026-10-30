import { Controller, Get } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  // Los umbrales dependen de la máquina. En macOS '/' es el volumen del sistema y
  // siempre está casi lleno: se mide el disco donde corre la app.
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('google', 'https://google.com'),
      () =>
        this.disk.checkStorage('disco', {
          path: process.cwd(),
          thresholdPercent: 0.95,
        }),
      () => this.memory.checkHeap('memoria', 300 * 1024 * 1024),
    ]);
  }
}
