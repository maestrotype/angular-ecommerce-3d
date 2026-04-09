import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GeoBounds } from '../pages/uav-mapping/uav-mapping.component';

export interface UavMappingResponse {
  task_id: string;
  status: string;
}

export interface UavTaskStatus {
  status: string;
  progress: number;
  model_url?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UavMappingService {
  private workerUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  processVideo(videoFile: File, cropOsd: boolean, bounds?: GeoBounds): Observable<UavMappingResponse> {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('crop_osd', String(cropOsd));

    if (bounds) {
      formData.append('bounds_north', String(bounds.north));
      formData.append('bounds_south', String(bounds.south));
      formData.append('bounds_east',  String(bounds.east));
      formData.append('bounds_west',  String(bounds.west));
    }

    return this.http.post<UavMappingResponse>(`${this.workerUrl}/uav-map`, formData);
  }

  getTaskStatus(taskId: string): Observable<UavTaskStatus> {
    return this.http.get<UavTaskStatus>(`${this.workerUrl}/generate/${taskId}`);
  }
}

