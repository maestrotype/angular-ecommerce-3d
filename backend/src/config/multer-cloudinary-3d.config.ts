import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.config';

export const storage3d = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'sections-3d',
    resource_type: 'raw', // Important for .glb!
    allowed_formats: ['glb'],
    public_id: `section3d-${Date.now()}.glb`,
  }),
});