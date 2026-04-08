# AI 3D Generation Modular Architecture Plan

This document outlines a technical proposal for abstracting the 3D generation pipeline. The goal is to allow administrators to choose between different AI services (e.g., Tripo3D, Meshy, Luma AI, or free/open-source self-hosted alternatives) based on cost, availability, or preference.

## 1. Abstract Provider Interface
Currently, the system is tightly coupled to `Tripo3dService`. We should introduce an abstract interface that all AI generation plugins will implement.

```typescript
export interface AiTaskResult {
  taskId: string;
  status: 'queued' | 'running' | 'success' | 'failed';
  progress: number;
  modelUrl?: string; // The URL to download the generated .glb file
  error?: string;
}

export abstract class AiGenerationProvider {
  /** Uniquely identifies the provider (e.g., 'tripo3d', 'meshy', 'custom') */
  abstract get providerId(): string;
  
  /** Submits an image for generation and returns a task ID */
  abstract generateTask(imageUrl: string): Promise<{ taskId: string }>;
  
  /** Checks the status of a specific task */
  abstract getTaskStatus(taskId: string): Promise<AiTaskResult>;
  
  /** Downloads the model from the provider URL to local storage */
  abstract downloadModel(url: string, filename: string): Promise<{ path: string }>;
}
```

## 2. Factory Pattern & Dependency Injection
Instead of injecting `Tripo3dService` directly into the controllers, we will inject a generic `AiGenerationService`. This service acts as a factory that picks the correct provider based on the database settings.

```typescript
@Injectable()
export class AiGenerationService {
  constructor(
    private settingsService: SettingsService,
    private tripo3dProvider: Tripo3dProvider,
    private meshyProvider: MeshyProvider,
    private customProvider: CustomProvider
  ) {}

  private async getActiveProvider(): Promise<AiGenerationProvider> {
    const activeId = await this.settingsService.get('aiGeneration.activeProvider');
    switch(activeId) {
      case 'meshy': return this.meshyProvider;
      case 'custom': return this.customProvider;
      case 'tripo3d':
      default:
        return this.tripo3dProvider;
    }
  }

  // Controller delegates calls to the active provider...
}
```

## 3. Supported Alternatives to Consider
To provide flexibility and options for varying budgets, we can plan integrations for:

1. **Tripo3D (Existing)**: Fast, high-quality, but paid API.
2. **Meshy (Alternative)**: Another popular dedicated service with different pricing tiers.
3. **Luma AI**: Known for high-quality generations (Genie API).
4. **HuggingFace Inference API (Free/Cheaper)**: We can support using open-source models (like CRM or CRM-based pipelines) hosted on Hugging Face spaces or APIs.
5. **Custom / Local Server (Free)**: A webhook-based plugin where the admin specifies their own endpoint URL. If the user runs an open-source model locally on their GPU (e.g., using `trellis` or `Trellis-WebUI`), our backend simply sends standard REST requests to that local URL.

## 4. Admin Panel UI Updates
The Integrations settings page (`/admin/integrations`) will be updated to include an **"Active AI Provider"** dropdown.

When a specific provider is selected from the dropdown:
- The form displays fields specific to that provider (e.g., `Meshy API Key`, `HuggingFace Token`, or `Custom Webhook URL`).
- The backend stores these settings under modular keys like `ai.meshy.apiKey`, `ai.tripo.apiKey`, `ai.custom.url`.

## 5. Security & Fallbacks
- The system must validate that the required keys are present before attempting to generate.
- The `Custom / Local Server` option allows ultimate freedom, making the system 100% free if the user hosts the AI logic themselves.
