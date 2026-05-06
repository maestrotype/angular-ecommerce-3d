import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface TripoTaskResponse {
  code: number;
  data: {
    task_id: string;
  };
  message: string;
}

export interface TripoStatusResponse {
  code: number;
  data: {
    task_id: string;
    status: 'queued' | 'running' | 'success' | 'failed';
    progress: number;
    result?: {
      model?: string;
    };
    localPath?: string;
    error?: string;
  };
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiGenerationService {
  // AI generation ALWAYS uses local backend — it needs a local Python server on port 8000.
  // It can never work via the production Render backend.
  private get apiUrl(): string {
    const isLocalhost = typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const base = isLocalhost ? 'http://localhost:3002/api' : environment.apiUrl;
    return base + '/ai-generation';
  }

  constructor(private http: HttpClient) {}

  generateModel(imageUrl: string, isHq: boolean = false): Observable<TripoTaskResponse> {
    return this.http.post<TripoTaskResponse>(`${this.apiUrl}/generate`, { imageUrl, isHq });
  }

  getTaskStatus(taskId: string): Observable<TripoStatusResponse> {
    return this.http.get<TripoStatusResponse>(`${this.apiUrl}/status/${taskId}`);
  }

  pollStatus(taskId: string): Observable<TripoStatusResponse> {
    return interval(3100).pipe(
      switchMap(() => this.getTaskStatus(taskId)),
      takeWhile(response => response.data?.status === 'queued' || response.data?.status === 'running', true)
    );
  }

  downloadModel(url: string, filename: string): Observable<{ success: boolean; path: string; publicId?: string }> {
    return this.http.post<{ success: boolean; path: string; publicId?: string }>(`${this.apiUrl}/download`, { url, filename });
  }

  getRecentTasks(limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/history`, { 
      params: { 
        limit: limit.toString(),
        'ngsw-bypass': 'true' 
      } 
    });
  }


}
