import { Injectable } from '@nestjs/common';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const execFileAsync = promisify(execFile);

export const CLOUDINARY_RAW_FILE_LIMIT = 10 * 1024 * 1024;

/** Max size allowed in DB / CDN after optimization. */
export const MAX_STORED_GLB_BYTES = 50 * 1024 * 1024;

/** Accept large raw uploads; GlbOptimizationService compresses before storage. */
export const RAW_GLB_UPLOAD_MAX_BYTES = 200 * 1024 * 1024;

@Injectable()
export class GlbOptimizationService {
  private resolveGltfTransformBin(): string {
    const candidates = [
      join(process.cwd(), 'node_modules', '.bin', 'gltf-transform'),
      join(process.cwd(), 'node_modules', '@gltf-transform', 'cli', 'bin', 'cli.js'),
    ];
    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate;
      }
    }
    throw new Error('gltf-transform CLI not found in node_modules');
  }

  private readSize(path: string): number {
    return readFileSync(path).length;
  }

  /** Optimize inputs above 512KB; caller must reject if still above 50MB. */
  async optimize(inputPath: string): Promise<string | null> {
    const onRender = process.env.RENDER === 'true' || process.env.NODE_ENV?.toLowerCase() === 'production';
    if (onRender || process.env.SKIP_GLB_OPTIMIZATION === 'true') {
      console.log('[GlbOptimization] Skipped on production Render (timeout/memory limits)');
      return null;
    }

    const inputSize = this.readSize(inputPath);
    if (inputSize <= 512 * 1024) {
      console.log('[GlbOptimization] Skipped — file already small (<512KB)');
      return null;
    }

    console.log(`[GlbOptimization] Optimizing ${(inputSize / 1024 / 1024).toFixed(2)}MB…`);

    const outputPath = `${inputPath}-optimized.glb`;
    try {
      const bin = this.resolveGltfTransformBin();
      const args = [
        'optimize',
        inputPath,
        outputPath,
        '--texture-compress',
        'webp',
      ];

      if (bin.endsWith('.js')) {
        await execFileAsync(process.execPath, [bin, ...args], { timeout: 300000 });
      } else {
        await execFileAsync(bin, args, { timeout: 300000 });
      }

      if (!existsSync(outputPath)) {
        return null;
      }

      const originalSize = this.readSize(inputPath);
      const optimizedSize = this.readSize(outputPath);
      console.log(
        `[GlbOptimization] Done: ${(originalSize / 1024 / 1024).toFixed(2)}MB -> ${(optimizedSize / 1024 / 1024).toFixed(2)}MB`,
      );
      return outputPath;
    } catch (error: any) {
      console.warn(`[GlbOptimization] Failed: ${error?.message || error}`);
      return null;
    }
  }

  isWithinStorageLimit(filePath: string): boolean {
    return this.readSize(filePath) <= MAX_STORED_GLB_BYTES;
  }
}
