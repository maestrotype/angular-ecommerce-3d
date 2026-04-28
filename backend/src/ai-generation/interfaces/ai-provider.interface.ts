export interface AiTaskResult {
  taskId: string;
  status: 'queued' | 'running' | 'success' | 'failed';
  progress: number;
  modelUrl?: string; // The URL to download the generated .glb file
  error?: string;
  localPath?: string; // The absolute path on the local worker
}

export abstract class AiGenerationProvider {
  /** Uniquely identifies the provider (e.g., 'tripo3d', 'meshy', 'custom') */
  abstract get providerId(): string;
  
  /** Submits an image for generation and returns a task ID */
  abstract generateTask(imageUrl: string, isHq?: boolean): Promise<{ taskId: string }>;
  
  /** Checks the status of a specific task */
  abstract getTaskStatus(taskId: string): Promise<AiTaskResult>;
  
  /** Returns a list of past tasks (history) */
  abstract listTasks(): Promise<any>;
}
