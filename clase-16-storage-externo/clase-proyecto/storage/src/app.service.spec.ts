import { v2 as cloudinary } from 'cloudinary';
import { AppService } from './app.service.js';

describe('AppService', () => {
  it('configura Cloudinary con las variables de entorno', () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'mi-nube';
    new AppService();
    expect(cloudinary.config().cloud_name).toBe('mi-nube');
  });
});
