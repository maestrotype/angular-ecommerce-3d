import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GeoBounds } from '../pages/uav-mapping/uav-mapping.component';
import { environment } from '../../environments/environment';

export interface UavMappingResponse {
  task_id: string;
  status: string;
}

export interface UavTaskStatus {
  status: string;
  progress: number;
  current_action?: string;
  model_url?: string;
  error?: string;
  text_analysis?: string;
}

export interface GeolocateFrame {
  index: number;
  filename: string;
  status: 'success' | 'failed';
  lat?: number;
  lng?: number;
  confidence?: number;
  footprint_corners?: number[][];
  zoom?: number;
  error?: string;
}

export interface MultiGeolocateResponse {
  status: string;
  task_id: string;
  frames?: GeolocateFrame[];
  route_confidence?: number;
  successful_frames?: number;
  total_frames?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UavMappingService {
  // Use global environment API URL which handles the correct port (3002)
  private apiUrl = `${environment.apiUrl}/uav-mapping`; 

  constructor(private http: HttpClient) {
    console.log('🚀 [UavMappingService] Initialized with API URL:', this.apiUrl);
  }

  processVideo(videoFile: File, cropOsd: boolean, bounds?: GeoBounds, referenceImageFile?: File | null, prompt?: string): Observable<UavMappingResponse> {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('crop_osd', String(cropOsd));
    
    // We send polygon as JSON string for easier destructuring in NestJS @Body
    if (bounds) {
      formData.append('polygon', JSON.stringify(bounds));
    }
    
    if (referenceImageFile) {
      formData.append('images', referenceImageFile); // NestJS expects 'images' field
    }
    
    if (prompt && prompt.trim() !== '') {
      formData.append('hints', prompt.trim()); // NestJS expects 'hints' field
    }

    return this.http.post<UavMappingResponse>(`${this.apiUrl}/process`, formData);
  }

  getTaskStatus(taskId: string): Observable<UavTaskStatus> {
    console.log(`📡 [UavMappingService] Polling status for taskId: "${taskId}"`);
    if (taskId === 'uav-mapping') {
      console.trace('🚨 [CRITICAL] Someone called getTaskStatus with "uav-mapping" string! See stack trace above.');
    }
    return this.http.get<UavTaskStatus>(`${this.apiUrl}/status/${taskId}`);
  }

  stopTask(taskId: string): Observable<any> {
    console.log(`🛑 [UavMappingService] Requesting stop for taskId: "${taskId}"`);
    return this.http.post(`${this.apiUrl}/stop/${taskId}`, {});
  }

  geolocateImage(imageFile: File, bounds: GeoBounds): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('bounds', JSON.stringify(bounds));
    return this.http.post(`${this.apiUrl}/geolocate-image`, formData);
  }

  geolocateMultiImages(imageFiles: File[], bounds: GeoBounds): Observable<any> {
    const formData = new FormData();
    imageFiles.forEach(file => formData.append('images', file));
    formData.append('bounds', JSON.stringify(bounds));
    return this.http.post<any>(`${this.apiUrl}/geolocate-multi`, formData);
  }

  getTaskResult(taskId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/result/${taskId}`);
  }
}

