import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 'imagen' es la clave del form-data. Más de 2 MB: 413 antes de llegar a Cloudinary.
  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', { limits: { fileSize: 1024 * 1024 * 2 } }),
  )
  async subirImagen(@UploadedFile() archivo: Express.Multer.File) {
    const url = await this.appService.subirArchivo(archivo);
    return { url };
  }
}
