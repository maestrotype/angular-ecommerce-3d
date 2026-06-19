import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export function getServerBaseUrl(): string {
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, '');
  }
  const isProduction =
    process.env.NODE_ENV?.toLowerCase() === 'production' ||
    process.env.RENDER === 'true';
  if (isProduction) {
    return 'https://angular-ecommerce-backend.onrender.com';
  }
  return 'http://localhost:3002';
}

export function isCloudinarySizeError(error: any): boolean {
  const message = error?.message || error?.error?.message || String(error || '');
  return (
    message.includes('File size too large') ||
    message.includes('10485760') ||
    message.includes('Maximum is 10485760')
  );
}

export interface LocalModelSaveResult {
  url: string;
  publicId: string;
  localPath: string;
}

export function saveModelToLocalDisk(
  uploadPath: string,
  isProduct: boolean,
  originalName: string,
): LocalModelSaveResult {
  const subFolder = isProduct ? 'products-3d' : 'sections-3d';
  const finalDir = join(__dirname, '..', '..', 'uploads', subFolder);
  if (!existsSync(finalDir)) {
    mkdirSync(finalDir, { recursive: true });
  }

  const isAi =
    originalName.toLowerCase().includes('ai-gen') ||
    originalName.toLowerCase().includes('task_');
  const prefix = isAi ? 'ai-gen' : isProduct ? 'product3d' : 'section3d';
  const finalFileName = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}.glb`;
  const finalPath = join(finalDir, finalFileName);

  writeFileSync(finalPath, readFileSync(uploadPath));

  const serverUrl = getServerBaseUrl();
  return {
    url: `${serverUrl}/uploads/${subFolder}/${finalFileName}`,
    publicId: `LOCAL:${finalPath}`,
    localPath: `/uploads/${subFolder}/${finalFileName}`,
  };
}
