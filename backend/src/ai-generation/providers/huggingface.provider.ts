import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';
import { firstValueFrom } from 'rxjs';
import axios, { AxiosRequestConfig } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { AiGenerationProvider, AiTaskResult } from '../interfaces/ai-provider.interface';
import { getProduct3dDir, getServerBaseUrl } from '../../services/model-storage.util';

interface HfJob {
  status: AiTaskResult['status'];
  progress: number;
  modelUrl?: string;
  error?: string;
}

const DEFAULT_SPACE = 'stabilityai/TripoSR';

@Injectable()
export class HuggingFaceProvider implements AiGenerationProvider {
  private readonly logger = new Logger(HuggingFaceProvider.name);
  private readonly jobs = new Map<string, HfJob>();

  constructor(private settingsService: SettingsService) {}

  get providerId(): string {
    return 'huggingface';
  }

  async generateTask(imageUrl: string): Promise<{ taskId: string }> {
    if (!imageUrl || imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1')) {
      throw new HttpException(
        'Hugging Face needs a public image URL (Cloudinary). Localhost images cannot be fetched by the Space.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const taskId = `hf-${Date.now()}`;
    this.jobs.set(taskId, { status: 'queued', progress: 5 });
    void this.runJob(taskId, imageUrl);
    return { taskId };
  }

  async getTaskStatus(taskId: string): Promise<AiTaskResult> {
    const job = this.jobs.get(taskId);
    if (!job) {
      return { taskId, status: 'failed', progress: 0, error: 'Hugging Face task expired. Generate again.' };
    }
    return {
      taskId,
      status: job.status,
      progress: job.progress,
      modelUrl: job.modelUrl,
      error: job.error,
    };
  }

  async listTasks(): Promise<any> {
    return { code: 0, data: [], message: 'Hugging Face Space has no persistent history' };
  }

  private async runJob(taskId: string, imageUrl: string): Promise<void> {
    try {
      this.patch(taskId, { status: 'running', progress: 15 });
      const space = await this.getSpaceId();
      const host = this.spaceHost(space);
      const headers = await this.authHeaders();

      await this.wakeSpace(host, headers);
      this.patch(taskId, { progress: 30 });

      const file = this.toFileData(imageUrl);
      let processed: unknown = file;
      try {
        const pre = await this.gradioCall(host, 'preprocess', [file, true, 0.85], headers);
        const extracted = this.extractFile(pre);
        if (extracted) {
          processed = extracted;
        }
      } catch (error) {
        this.logger.warn(`TripoSR preprocess skipped: ${error.message}`);
      }

      this.patch(taskId, { progress: 55 });
      const generated = await this.gradioCall(host, 'generate', [processed, 256], headers);
      const remoteUrl = this.extractGlbUrl(generated, host);
      if (!remoteUrl) {
        throw new Error('TripoSR Space did not return a GLB file');
      }

      this.patch(taskId, { progress: 85 });
      const modelUrl = await this.persistGlb(remoteUrl, host, taskId, headers);
      this.patch(taskId, { status: 'success', progress: 100, modelUrl });
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message;
      this.logger.error(`Hugging Face generation failed: ${message}`);
      this.patch(taskId, {
        status: 'failed',
        progress: 0,
        error: `Hugging Face TripoSR: ${message}`,
      });
    }
  }

  private async getSpaceId(): Promise<string> {
    const setting = await firstValueFrom(this.settingsService.getSettingByKey('ai.hfSpace')).catch(() => null);
    return setting?.value?.trim() || DEFAULT_SPACE;
  }

  private async authHeaders(): Promise<Record<string, string>> {
    const setting = await firstValueFrom(this.settingsService.getSettingByKey('ai.hfToken')).catch(() => null);
    const token = setting?.value?.trim() || process.env.HF_TOKEN?.trim();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  private spaceHost(spaceId: string): string {
    return `https://${spaceId.replace('/', '-').toLowerCase()}.hf.space`;
  }

  private toFileData(imageUrl: string) {
    return {
      path: imageUrl,
      url: imageUrl,
      orig_name: 'product.jpg',
      meta: { _type: 'gradio.FileData' },
    };
  }

  private async wakeSpace(host: string, headers: Record<string, string>): Promise<void> {
    try {
      await axios.get(host, { headers, timeout: 60000, validateStatus: () => true });
    } catch (error) {
      this.logger.warn(`Could not wake Hugging Face Space: ${error.message}`);
    }
  }

  private async gradioCall(host: string, apiName: string, data: unknown[], headers: Record<string, string>): Promise<unknown> {
    const endpoints = [
      `${host}/gradio_api/call/${apiName}`,
      `${host}/call/${apiName}`,
    ];

    let lastError: Error | null = null;
    for (const endpoint of endpoints) {
      try {
        const started = await axios.post(endpoint, { data }, { headers, timeout: 30000 });
        const eventId = started.data?.event_id || started.data?.eventId;
        if (!eventId) {
          if (started.data) {
            return started.data;
          }
          continue;
        }
        return await this.readGradioResult(`${endpoint}/${eventId}`, headers);
      } catch (error) {
        lastError = error;
        if (error.response?.status && error.response.status !== 404) {
          throw error;
        }
      }
    }
    throw lastError || new Error(`Gradio endpoint /${apiName} is unavailable`);
  }

  private async readGradioResult(url: string, headers: Record<string, string>): Promise<unknown> {
    const config: AxiosRequestConfig = {
      headers: { ...headers, Accept: 'text/event-stream' },
      timeout: 180000,
      responseType: 'text',
      transformResponse: [(body) => body],
    };
    const response = await axios.get(url, config);
    const text = String(response.data || '');
    const chunks = text.split('\n\n');

    for (const chunk of chunks) {
      const event = /event:\s*(\w+)/.exec(chunk)?.[1];
      const dataLine = chunk.split('\n').find((line) => line.startsWith('data:'));
      if (!dataLine) {
        continue;
      }
      const payload = dataLine.slice(5).trim();
      if (event === 'error') {
        throw new Error(payload || 'Hugging Face Space returned an error');
      }
      if (event === 'complete') {
        return JSON.parse(payload);
      }
    }

    const lastData = [...text.split('\n')].reverse().find((line) => line.startsWith('data:'));
    if (lastData) {
      const payload = lastData.slice(5).trim();
      if (payload && payload !== 'null') {
        return JSON.parse(payload);
      }
    }
    throw new Error('Hugging Face Space timed out or returned an empty result');
  }

  private extractFile(result: unknown): Record<string, unknown> | null {
    const files = this.flatten(result).filter((item) => item && typeof item === 'object' && ((item as any).url || (item as any).path));
    return (files[0] as Record<string, unknown>) || null;
  }

  private extractGlbUrl(result: unknown, host: string): string | null {
    const files = this.flatten(result).filter((item) => item && typeof item === 'object');
    const glb = files.find((item: any) =>
      String(item.orig_name || item.path || item.url || '').toLowerCase().includes('.glb'),
    ) as any;
    const fallback = (files[files.length - 1] || {}) as any;
    const raw = glb?.url || glb?.path || fallback.url || fallback.path;
    if (!raw || typeof raw !== 'string') {
      return null;
    }
    return this.toGradioFileUrl(raw, host);
  }

  private toGradioFileUrl(raw: string, host: string): string {
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return raw;
    }
    if (raw.includes('/gradio_api/file=') || raw.startsWith('/file=') || raw.includes('/file=')) {
      return raw.startsWith('/') ? `${host}${raw}` : `${host}/${raw}`;
    }
    const filePath = raw.startsWith('/') ? raw : `/${raw}`;
    return `${host}/gradio_api/file=${filePath}`;
  }

  private async persistGlb(
    remoteUrl: string,
    host: string,
    taskId: string,
    headers: Record<string, string>,
  ): Promise<string> {
    const candidates = this.glbUrlCandidates(remoteUrl, host);
    let buffer: Buffer | null = null;
    let lastError = '';

    for (const url of candidates) {
      try {
        this.logger.log(`Downloading Hugging Face GLB from ${url}`);
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          timeout: 120000,
          maxRedirects: 5,
          headers: { ...headers, Accept: '*/*' },
          validateStatus: (status) => status >= 200 && status < 400,
        });
        const next = Buffer.from(response.data);
        if (next.length > 100) {
          buffer = next;
          break;
        }
      } catch (error) {
        lastError = `${error.response?.status || ''} ${error.message}`.trim();
        this.logger.warn(`GLB download missed ${url}: ${lastError}`);
      }
    }

    if (!buffer) {
      throw new Error(`Could not download the generated GLB from Hugging Face (${lastError || 'empty file'})`);
    }

    const uploadsDir = getProduct3dDir();
    const filename = `${taskId.replace(/[^a-zA-Z0-9_-]/g, '-')}.glb`;
    fs.writeFileSync(path.join(uploadsDir, filename), buffer);
    return `${getServerBaseUrl()}/uploads/products-3d/${filename}`;
  }

  private glbUrlCandidates(url: string, host: string): string[] {
    const urls = [url];
    try {
      const parsed = new URL(url);
      const fromQuery = parsed.searchParams.get('file');
      const fromPath = parsed.pathname.includes('file=')
        ? decodeURIComponent(parsed.pathname.split('file=')[1] || '')
        : '';
      const filePath = fromQuery || fromPath;
      if (filePath) {
        const normalized = filePath.startsWith('/') ? filePath : `/${filePath}`;
        urls.push(`${host}/gradio_api/file=${normalized}`);
        urls.push(`${host}/file=${normalized}`);
      }
    } catch {
      // ignore invalid URLs
    }
    return [...new Set(urls)];
  }

  private flatten(value: unknown): unknown[] {
    if (Array.isArray(value)) {
      return value.flatMap((item) => this.flatten(item));
    }
    return value == null ? [] : [value];
  }

  private patch(taskId: string, patch: Partial<HfJob>): void {
    const current = this.jobs.get(taskId) || { status: 'queued' as const, progress: 0 };
    this.jobs.set(taskId, { ...current, ...patch });
  }
}
