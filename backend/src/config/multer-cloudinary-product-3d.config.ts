import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.config';

export const productStorage3d = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'products-3d',
    resource_type: 'raw', // Important for .glb!
    allowed_formats: ['glb'],
    public_id: `product3d-${Date.now()}`,
  }),
});
