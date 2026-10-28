import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import { UsuarioService } from './usuario.service.js';

describe('UsuarioService', () => {
  const cache = new Map<string, unknown>();
  const cacheManager = {
    get: vi.fn(async (k: string) => cache.get(k)),
    set: vi.fn(async (k: string, v: unknown) => cache.set(k, v)),
    del: vi.fn(async (k: string) => cache.delete(k)),
  };
  let service: UsuarioService;

  beforeEach(async () => {
    cache.clear();
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        UsuarioService,
        { provide: CACHE_MANAGER, useValue: cacheManager },
      ],
    }).compile();
    service = module.get(UsuarioService);
  });

  it('guarda en el caché sólo la primera vez', async () => {
    await service.findAll();
    await service.findAll();
    expect(cacheManager.set).toHaveBeenCalledTimes(1);
  });

  it('update invalida el caché', async () => {
    await service.findAll();
    await service.update(1, {});
    await service.findAll();
    expect(cacheManager.set).toHaveBeenCalledTimes(2);
  });
});
