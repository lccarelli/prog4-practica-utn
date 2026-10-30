import { BadRequestException, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class AppService {
  // Una sola vez, no en cada petición.
  constructor() {
    cloudinary.config({
      api_key: process.env.CLOUDINARY_API_KEY ?? '',
      api_secret: process.env.CLOUDINARY_API_SECRET ?? '',
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    });
  }

  async subirArchivo(archivo: Express.Multer.File | undefined) {
    if (!archivo?.mimetype.startsWith('image/')) {
      throw new BadRequestException('Falta la imagen');
    }

    // El buffer suelto llega vacío a Cloudinary: se manda como data URI.
    const base64 = archivo.buffer.toString('base64');
    const uri = `data:${archivo.mimetype};base64,${base64}`;

    const resultado = await cloudinary.uploader.upload(uri, {
      folder: 'clase-16',
      public_id: `${Date.now()}-clase`, // la extensión la agrega Cloudinary
    });

    return resultado.secure_url;
  }
}
