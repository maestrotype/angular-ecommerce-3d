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

type OptimizeProfile = 'light' | 'aggressive';

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

  private profileArgs(profile: OptimizeProfile): string[] {
    if (profile === 'light') {
      // Preserve mesh fidelity; compress textures only.
      return [
        '--compress',
        'false',
        '--flatten',
        'false',
        '--join',
        'false',
        '--instance',
        'false',
        '--weld',
        'false',
        '--texture-compress',
        'webp',
        '--texture-size',
        '4096',
      ];
    }

    // Large uploads only: mesh compression to reach the 50MB storage cap.
    return ['--compress', 'meshopt', '--texture-compress', 'webp', '--texture-size', '2048'];
  }

  private async runOptimize(
    inputPath: string,
    profile: OptimizeProfile,
  ): Promise<string | null> {
    const outputPath = `${inputPath}-optimized.glb`;

    try {
      const bin = this.resolveGltfTransformBin();
      const args = ['optimize', inputPath, outputPath, ...this.profileArgs(profile)];

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
        `[GlbOptimization] ${profile}: ${(originalSize / 1024 / 1024).toFixed(2)}MB -> ${(optimizedSize / 1024 / 1024).toFixed(2)}MB`,
      );
      return outputPath;
    } catch (error: any) {
      console.warn(`[GlbOptimization] Failed (${profile}): ${error?.message || error}`);
      return null;
    }
  }

  /**
   * Skip models already under 10MB (TripoSR / uploads stay untouched).
   * Light pass for 10–50MB (textures only).
   * Aggressive pass only when the raw file exceeds the 50MB storage cap.
   */
  async optimize(inputPath: string): Promise<string | null> {
    const onRender = process.env.RENDER === 'true' || process.env.NODE_ENV?.toLowerCase() === 'production';
    if (onRender || process.env.SKIP_GLB_OPTIMIZATION === 'true') {
      console.log('[GlbOptimization] Skipped on production Render (timeout/memory limits)');
      return null;
    }

    const inputSize = this.readSize(inputPath);
    if (inputSize <= CLOUDINARY_RAW_FILE_LIMIT) {
      console.log('[GlbOptimization] Skipped — already within 10MB limit');
      return null;
    }

    const profile: OptimizeProfile =
      inputSize > MAX_STORED_GLB_BYTES ? 'aggressive' : 'light';

    console.log(
      `[GlbOptimization] Running ${profile} optimize for ${(inputSize / 1024 / 1024).toFixed(2)}MB file…`,
    );
    return this.runOptimize(inputPath, profile);
  }

  isWithinStorageLimit(filePath: string): boolean {
    return this.readSize(filePath) <= MAX_STORED_GLB_BYTES;
  }
}
