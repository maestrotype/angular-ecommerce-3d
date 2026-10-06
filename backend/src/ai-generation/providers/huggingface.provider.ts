import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { SettingsService } from '../../settings/settings.service';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';
import { randomBytes } from 'crypto';
import { AiGenerationProvider, AiTaskResult } from '../interfaces/ai-provider.interface';
import { getProduct3dDir, getServerBaseUrl } from '../../services/model-storage.util';

interface HfJob {
  status: AiTaskResult['status'];
  progress: number;
  modelUrl?: string;
  error?: string;
}

const DEFAULT_SPACE = 'stabilityai/TripoSR';
const TRANSIENT_HTTP = new Set([502, 503, 504]);
const MAX_TRANSIENT_RETRIES = 4;
const RETRY_BASE_MS = 2500;

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

    const taskId = `${this.taskPrefix}-${Date.now()}`;
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

  protected spaceUnavailableKey = 'HF_TRIPOSR_SPACE_UNAVAILABLE';
  protected providerLabel = 'Hugging Face TripoSR';
  protected taskPrefix = 'hf';

  protected async resolveSpaceId(): Promise<string> {
    return this.getSpaceId();
  }

  protected async createRemoteGlb(
    host: string,
    headers: Record<string, string>,
    imageUrl: string,
  ): Promise<string | null> {
    const file = this.toFileData(imageUrl);
    let processed: unknown = file;
    try {
      const pre = await this.withTransientRetry('TripoSR preprocess', () =>
        this.gradioCall(host, 'preprocess', [file, true, 0.85], headers),
      );
      const extracted = this.extractFile(pre);
      if (extracted) {
        processed = extracted;
      }
    } catch (error) {
      this.logger.warn(`TripoSR preprocess skipped: ${error.message}`);
    }

    const generated = await this.withTransientRetry('TripoSR generate', () =>
      this.gradioCall(host, 'generate', [processed, 256], headers),
    );
    return this.extractGlbUrl(generated, host);
  }

  private async runJob(taskId: string, imageUrl: string): Promise<void> {
    try {
      this.patch(taskId, { status: 'running', progress: 15 });
      const space = await this.resolveSpaceId();
      const host = this.spaceHost(space);
      const headers = await this.authHeaders();

      await this.wakeSpace(host, headers);
      await this.sleep(1500);
      this.patch(taskId, { progress: 45 });

      const remoteUrl = await this.createRemoteGlb(host, headers, imageUrl);
      if (!remoteUrl) {
        throw new Error(`${this.providerLabel} Space did not return a GLB file`);
      }

      this.patch(taskId, { progress: 85 });
      const modelUrl = await this.persistGlb(remoteUrl, host, taskId, headers);
      this.patch(taskId, { status: 'success', progress: 100, modelUrl });
    } catch (error) {
      const message = this.resolveJobErrorMessage(error);
      this.logger.error(`Hugging Face generation failed: ${message || '(no detail)'}`);
      const status = error.response?.status as number | undefined;
      const userError =
        status && TRANSIENT_HTTP.has(status)
          ? this.spaceUnavailableKey
          : message?.startsWith('HF_')
            ? message
            : message
              ? `${this.providerLabel}: ${message}`
              : this.spaceUnavailableKey;
      this.patch(taskId, {
        status: 'failed',
        progress: 0,
        error: userError,
      });
    }
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private isTransientAxiosError(error: unknown): boolean {
    const status = (error as { response?: { status?: number } })?.response?.status;
    return status != null && TRANSIENT_HTTP.has(status);
  }

  protected async withTransientRetry<T>(label: string, fn: () => Promise<T>): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt < MAX_TRANSIENT_RETRIES; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (!this.isTransientAxiosError(error) || attempt === MAX_TRANSIENT_RETRIES - 1) {
          throw error;
        }
        const waitMs = RETRY_BASE_MS * (attempt + 1);
        this.logger.warn(`${label} transient HTTP error, retry ${attempt + 1}/${MAX_TRANSIENT_RETRIES - 1} in ${waitMs}ms`);
        await this.sleep(waitMs);
      }
    }
    throw lastError;
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

  protected toFileData(imageUrl: string) {
    return {
      path: imageUrl,
      url: imageUrl,
      orig_name: 'product.jpg',
      meta: { _type: 'gradio.FileData' },
    };
  }

  /** Public http(s) URLs can be fetched by the Space. Local demo paths cannot. */
  protected isRemoteImageUrl(imageUrl: string): boolean {
    return /^https?:\/\//i.test(imageUrl)
      && !imageUrl.includes('localhost')
      && !imageUrl.includes('127.0.0.1');
  }

  protected resolveLocalImagePath(imageUrl: string): string | null {
    const clean = imageUrl.split('?')[0].replace(/^https?:\/\/[^/]+/i, '').replace(/^\//, '');
    if (!clean || clean.includes('..')) {
      return null;
    }
    const candidates = [
      path.resolve(process.cwd(), clean),
      path.resolve(process.cwd(), 'src', clean),
      path.resolve(process.cwd(), '..', 'src', clean),
      path.resolve(process.cwd(), '..', clean),
    ];
    return candidates.find((candidate) => {
      try {
        return fs.existsSync(candidate) && fs.statSync(candidate).isFile();
      } catch {
        return false;
      }
    }) || null;
  }

  /** Upload a local product photo so the Space can read it. */
  protected async uploadImageToSpace(
    host: string,
    filePath: string,
    headers: Record<string, string>,
  ): Promise<string> {
    const auth = headers.Authorization ? { Authorization: headers.Authorization } : {};
    const uploadPaths = [`${host}/upload`, `${host}/gradio_api/upload`];
    let response: { data?: unknown } | null = null;
    let lastError: unknown;
    for (const uploadUrl of uploadPaths) {
      const form = new FormData();
      form.append('files', fs.createReadStream(filePath), path.basename(filePath));
      try {
        response = await axios.post(uploadUrl, form, {
          headers: { ...form.getHeaders(), ...auth },
          timeout: 60000,
          maxBodyLength: Infinity,
        });
        break;
      } catch (error) {
        lastError = error;
        if (error.response?.status !== 404) {
          throw error;
        }
      }
    }
    if (!response) {
      throw lastError;
    }
    const uploaded = Array.isArray(response.data) ? response.data[0] : null;
    if (!uploaded || typeof uploaded !== 'string') {
      throw new Error('Hugging Face Space did not accept the product image');
    }
    return uploaded;
  }

  protected async imageForSpace(
    host: string,
    headers: Record<string, string>,
    imageUrl: string,
  ) {
    if (this.isRemoteImageUrl(imageUrl)) {
      return this.toFileData(imageUrl);
    }
    const localPath = this.resolveLocalImagePath(imageUrl);
    if (!localPath) {
      throw new HttpException(
        'HF_IMAGE_NOT_PUBLIC',
        HttpStatus.BAD_REQUEST,
      );
    }
    const uploaded = await this.uploadImageToSpace(host, localPath, headers);
    return {
      path: uploaded,
      orig_name: path.basename(localPath),
      meta: { _type: 'gradio.FileData' },
    };
  }

  private async wakeSpace(host: string, headers: Record<string, string>): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await axios.get(host, { headers, timeout: 60000, validateStatus: () => true });
        if (!TRANSIENT_HTTP.has(response.status)) {
          return;
        }
        this.logger.warn(`Hugging Face Space wake returned ${response.status}, retrying…`);
      } catch (error) {
        this.logger.warn(`Could not wake Hugging Face Space: ${error.message}`);
      }
      await this.sleep(RETRY_BASE_MS * (attempt + 1));
    }
  }

  protected resolveJobErrorMessage(error: unknown): string {
    const err = error as {
      response?: { data?: { error?: unknown; message?: unknown } };
      message?: unknown;
    };
    const raw = err.response?.data?.error ?? err.response?.data?.message ?? err.message;
    if (raw == null || raw === 'null') {
      return '';
    }
    return String(raw);
  }

  protected async gradioCall(
    host: string,
    apiName: string,
    data: unknown[],
    headers: Record<string, string>,
    resultTimeoutMs = 180000,
  ): Promise<unknown> {
    const endpoints = [
      `${host}/call/${apiName}`,
      `${host}/gradio_api/call/${apiName}`,
    ];

    let lastError: Error | null = null;
    for (const endpoint of endpoints) {
      try {
        const started = await this.withTransientRetry(`Gradio ${apiName} start`, () =>
          axios.post(endpoint, { data }, { headers, timeout: 30000 }),
        );
        const eventId = started.data?.event_id || started.data?.eventId;
        if (!eventId) {
          if (started.data) {
            return started.data;
          }
          continue;
        }
        return await this.readGradioResult(`${endpoint}/${eventId}`, headers, resultTimeoutMs);
      } catch (error) {
        lastError = error;
        const status = error.response?.status as number | undefined;
        // A missing route is HTTP 404. Gradio 5 closes the legacy /call path
        // with a socket reset and no status — try the other prefix in that case too.
        // A started job that fails with a real HTTP status must not be replaced.
        if (status != null && status !== 404) {
          throw error;
        }
      }
    }
    throw lastError || new Error(`Gradio endpoint /${apiName} is unavailable`);
  }

  private async readGradioResult(url: string, headers: Record<string, string>, timeoutMs = 180000): Promise<unknown> {
    const getHeaders = { ...headers, Accept: 'text/event-stream' };
    delete getHeaders['Content-Type'];
    const text = await new Promise<string>((resolve, reject) => {
      let body = '';
      const finish = () => resolve(body);
      axios.get(url, {
        headers: getHeaders,
        timeout: timeoutMs,
        responseType: 'stream',
      }).then((response) => {
        const stream = response.data as NodeJS.ReadableStream & { destroy?: () => void };
        stream.on('data', (chunk: Buffer) => {
          body += chunk.toString();
          if (body.includes('event: complete') || body.includes('event: error')) {
            stream.destroy?.();
            finish();
          }
        });
        stream.on('end', finish);
        stream.on('error', () => finish());
      }).catch((error) => {
        if (body.includes('event: complete') || body.includes('event: error')) {
          finish();
          return;
        }
        reject(error);
      });
    });
    const chunks = text.split('\n\n');

    for (const chunk of chunks) {
      const event = /event:\s*(\w+)/.exec(chunk)?.[1];
      const dataLine = chunk.split('\n').find((line) => line.startsWith('data:'));
      if (!dataLine) {
        continue;
      }
      const payload = dataLine.slice(5).trim();
      if (event === 'error') {
        if (!payload || payload === 'null') {
          throw new Error('Hugging Face Space job failed without details');
        }
        throw new Error(payload);
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

  /** Gradio queue join. State inputs (hidden from /call) must be included. Calls share one session. */
  protected async gradioSessionCall(
    host: string,
    headers: Record<string, string>,
    steps: Array<{ api: string; data: unknown[] }>,
    resultTimeoutMs = 180000,
  ): Promise<unknown> {
    const config = await axios.get(`${host}/config`, { headers, timeout: 20000 });
    const dependencies = (config.data?.dependencies || []) as Array<{ api_name?: string }>;
    const session = randomBytes(8).toString('hex');
    let lastResult: unknown = null;

    for (const step of steps) {
      const fnIndex = dependencies.findIndex((dep) => dep.api_name === step.api);
      if (fnIndex < 0) {
        throw new Error(`Gradio endpoint /${step.api} is unavailable`);
      }
      await axios.post(
        `${host}/gradio_api/queue/join`,
        { data: step.data, fn_index: fnIndex, session_hash: session },
        { headers, timeout: 30000 },
      );
      lastResult = await this.readQueueResult(host, session, headers, resultTimeoutMs);
    }
    return lastResult;
  }

  private async readQueueResult(
    host: string,
    session: string,
    headers: Record<string, string>,
    timeoutMs: number,
  ): Promise<unknown> {
    const deadline = Date.now() + timeoutMs;
    let buffer = '';
    const getHeaders = { ...headers, Accept: 'text/event-stream' };
    delete getHeaders['Content-Type'];

    while (Date.now() < deadline) {
      const remaining = deadline - Date.now();
      try {
        buffer += await this.collectQueueStream(host, session, getHeaders, remaining);
      } catch (error) {
        const message = String((error as { message?: string })?.message || error);
        if (!/hang up|ECONNRESET|aborted|socket/i.test(message)) {
          throw error;
        }
      }
      const finished = this.parseQueueCompletion(buffer);
      if (finished !== undefined) {
        return finished;
      }
      await this.sleep(400);
    }
    throw new Error('Hugging Face Space timed out or returned an empty result');
  }

  private collectQueueStream(
    host: string,
    session: string,
    headers: Record<string, string>,
    timeoutMs: number,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let body = '';
      axios.get(`${host}/gradio_api/queue/data?session_hash=${session}`, {
        headers,
        timeout: Math.max(timeoutMs, 1000),
        responseType: 'stream',
      }).then((response) => {
        const stream = response.data as NodeJS.ReadableStream;
        stream.on('data', (chunk: Buffer) => {
          body += chunk.toString();
          if (body.includes('process_completed')) {
            stream.unpipe?.();
            response.data.destroy?.();
            resolve(body);
          }
        });
        stream.on('end', () => resolve(body));
        stream.on('error', (error) => {
          if (body) {
            resolve(body);
            return;
          }
          reject(error);
        });
      }).catch((error) => {
        if (body) {
          resolve(body);
          return;
        }
        reject(error);
      });
    });
  }

  /** Returns the output data, throws on a failed job, or undefined while the job is still running. */
  private parseQueueCompletion(buffer: string): unknown | undefined {
    for (const line of buffer.split('\n')) {
      if (!line.startsWith('data:')) {
        continue;
      }
      let msg: { msg?: string; output?: { error?: unknown; data?: unknown }; success?: boolean };
      try {
        msg = JSON.parse(line.slice(5).trim());
      } catch {
        continue;
      }
      if (msg.msg !== 'process_completed') {
        continue;
      }
      if (msg.success === false) {
        const detail = msg.output?.error;
        const textDetail = detail == null ? '' : String(detail);
        if (/zerogpu quota/i.test(textDetail)) {
          throw new Error('HF_TRELLIS_QUOTA');
        }
        throw new Error(textDetail || 'Hugging Face Space job failed without details');
      }
      return msg.output?.data ?? msg.output;
    }
    return undefined;
  }

  protected extractFile(result: unknown): Record<string, unknown> | null {
    const files = this.flatten(result)
      .map((item) => this.unwrapGradioCell(item))
      .filter((item) => item && typeof item === 'object' && ((item as any).url || (item as any).path));
    return (files[0] as Record<string, unknown>) || null;
  }

  private unwrapGradioCell(item: unknown): unknown {
    if (!item || typeof item !== 'object') {
      return item;
    }
    const cell = item as { value?: unknown; __type__?: string };
    if (cell.__type__ === 'update' && cell.value != null) {
      return cell.value;
    }
    return item;
  }

  protected extractGlbUrl(result: unknown, host: string, preferLast = false): string | null {
    const files = this.flatten(result)
      .map((item) => this.unwrapGradioCell(item))
      .filter((item) => item && typeof item === 'object');
    const glbs = files.filter((item: any) =>
      String(item.orig_name || item.path || item.url || '').toLowerCase().includes('.glb'),
    ) as any[];
    const glb = preferLast ? glbs[glbs.length - 1] : glbs[0];
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

/** Textured image-to-3D on the public Hunyuan3D-2 Space. Higher fidelity than TripoSR; no paid key. */
@Injectable()
export class HunyuanSpaceProvider extends HuggingFaceProvider {
  get providerId(): string {
    return 'hunyuan-free';
  }

  protected spaceUnavailableKey = 'HF_HUNYUAN_SPACE_UNAVAILABLE';
  protected providerLabel = 'Hunyuan3D 2';
  protected taskPrefix = 'hy';

  constructor(settingsService: SettingsService) {
    super(settingsService);
  }

  protected async resolveSpaceId(): Promise<string> {
    return 'tencent/Hunyuan3D-2';
  }

  protected async createRemoteGlb(
    host: string,
    headers: Record<string, string>,
    imageUrl: string,
  ): Promise<string | null> {
    const file = await this.imageForSpace(host, headers, imageUrl);
    // generation_all fails on the public Gradio API (error event, null payload); shape_generation returns white_mesh.glb.
    const generated = await this.gradioCall(
      host,
      'shape_generation',
      ['', file, null, null, null, null, 50, 5.5, 1234, 384, true, 20000, true],
      headers,
      300000,
    );
    return this.extractGlbUrl(generated, host, false);
  }
}

/** Textured image-to-3D on the public TRELLIS Space. Returns a GLB with a baked texture. */
@Injectable()
export class TrellisSpaceProvider extends HuggingFaceProvider {
  get providerId(): string {
    return 'trellis-free';
  }

  protected spaceUnavailableKey = 'HF_TRELLIS_SPACE_UNAVAILABLE';
  protected providerLabel = 'TRELLIS';
  protected taskPrefix = 'tr';

  constructor(settingsService: SettingsService) {
    super(settingsService);
  }

  protected async resolveSpaceId(): Promise<string> {
    return 'trellis-community/TRELLIS';
  }

  protected async createRemoteGlb(
    host: string,
    headers: Record<string, string>,
    imageUrl: string,
  ): Promise<string | null> {
    const file = await this.imageForSpace(host, headers, imageUrl);
    const preprocessed = await this.gradioCall(host, 'preprocess_image', [file], headers, 60000);
    const image = this.extractFile(preprocessed) || file;
    const generated = await this.gradioSessionCall(
      host,
      headers,
      [
        { api: 'start_session', data: [] },
        {
          api: 'generate_and_extract_glb',
          data: [image, [], false, 0, 7.5, 8, 3.0, 8, 'stochastic', 0.95, 1024],
        },
      ],
      180000,
    );
    return this.extractGlbUrl(generated, host, true);
  }
}
