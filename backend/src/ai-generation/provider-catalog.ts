export interface AiProviderMeta {
  id: string;
  name: string;
  configKey: string;
  implemented: boolean;
}

export const AI_PROVIDER_CATALOG: AiProviderMeta[] = [
  { id: 'tripo3d', name: 'Tripo3D', configKey: 'ai.tripoApiKey', implemented: true },
  { id: 'meshy', name: 'Meshy', configKey: 'ai.meshyApiKey', implemented: true },
  { id: 'hunyuan3d', name: 'Hunyuan3D', configKey: 'ai.hunyuanApiKey', implemented: true },
  { id: 'luma', name: 'Luma AI', configKey: 'ai.lumaApiKey', implemented: false },
  { id: 'huggingface', name: 'Hugging Face TripoSR (free)', configKey: 'ai.hfToken', implemented: true },
  { id: 'custom', name: 'Custom webhook', configKey: 'ai.customUrl', implemented: true },
];

const PROVIDER_ALIASES: Record<string, string> = {
  tripo: 'tripo3d',
  hunyuan: 'hunyuan3d',
  hunyuan3d: 'hunyuan3d',
  hunyuan_v2: 'hunyuan3d',
  unique3d: 'custom',
  hf: 'huggingface',
  triposr: 'huggingface',
};

const TASK_SEPARATOR = '::';

export function normalizeProviderId(raw?: string | null): string {
  const id = (raw || '').trim().toLowerCase();
  if (!id) {
    return 'tripo3d';
  }
  return PROVIDER_ALIASES[id] || id;
}

export function encodeProviderTaskId(providerId: string, remoteTaskId: string): string {
  if (!remoteTaskId) {
    return remoteTaskId;
  }
  if (remoteTaskId.includes(TASK_SEPARATOR)) {
    return remoteTaskId;
  }
  return `${normalizeProviderId(providerId)}${TASK_SEPARATOR}${remoteTaskId}`;
}

export function decodeProviderTaskId(taskId: string): { providerId: string | null; remoteTaskId: string } {
  const separatorIndex = taskId.indexOf(TASK_SEPARATOR);
  if (separatorIndex <= 0) {
    return { providerId: null, remoteTaskId: taskId };
  }
  return {
    providerId: normalizeProviderId(taskId.slice(0, separatorIndex)),
    remoteTaskId: taskId.slice(separatorIndex + TASK_SEPARATOR.length),
  };
}

export function getProviderMeta(id: string): AiProviderMeta | undefined {
  return AI_PROVIDER_CATALOG.find((item) => item.id === normalizeProviderId(id));
}
