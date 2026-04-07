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
  };
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiGenerationService {
  private apiUrl = environment.apiUrl + '/tripo-api';

  constructor(private http: HttpClient) {}

  generateModel(imageUrl: string): Observable<TripoTaskResponse> {
    return this.http.post<TripoTaskResponse>(`${this.apiUrl}/generate`, { imageUrl });
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

  downloadModel(url: string, filename: string): Observable<{ success: boolean; path: string }> {
    return this.http.post<{ success: boolean; path: string }>(`${this.apiUrl}/download`, { url, filename });
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
