import { Injectable } from '@nestjs/common';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const execFileAsync = promisify(execFile);

export const CLOUDINARY_RAW_FILE_LIMIT = 10 * 1024 * 1024;

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

  async optimize(inputPath: string): Promise<string | null> {
    const onRender = process.env.RENDER === 'true' || process.env.NODE_ENV?.toLowerCase() === 'production';
    if (onRender || process.env.SKIP_GLB_OPTIMIZATION === 'true') {
      console.log('[GlbOptimization] Skipped on production Render (timeout/memory limits)');
      return null;
    }

    const inputSize = readFileSync(inputPath).length;
    if (inputSize <= CLOUDINARY_RAW_FILE_LIMIT) {
      console.log('[GlbOptimization] Skipped — file already under Cloudinary 10MB limit');
      return null;
    }

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

      console.log(`[GlbOptimization] Optimizing ${inputPath} -> ${outputPath}`);
      if (bin.endsWith('.js')) {
        await execFileAsync(process.execPath, [bin, ...args], { timeout: 300000 });
      } else {
        await execFileAsync(bin, args, { timeout: 300000 });
      }

      if (!existsSync(outputPath)) {
        return null;
      }

      const originalSize = readFileSync(inputPath).length;
      const optimizedSize = readFileSync(outputPath).length;
      console.log(
        `[GlbOptimization] Done: ${(originalSize / 1024 / 1024).toFixed(2)}MB -> ${(optimizedSize / 1024 / 1024).toFixed(2)}MB`,
      );
      return outputPath;
    } catch (error: any) {
      console.warn(`[GlbOptimization] Failed, using original file: ${error?.message || error}`);
      return null;
    }
  }
}
