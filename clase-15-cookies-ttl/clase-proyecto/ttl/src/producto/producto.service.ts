import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductoService {
  algo() {
    return 'ProductoService cargado recién ahora';
  }
}
