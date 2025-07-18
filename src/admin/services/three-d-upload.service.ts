import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class ThreeDUploadService {
  constructor(private http: HttpClient) {}

  upload3dModel(file: File, type: 'product' | 'section'): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('model', file);
    const endpoint = type === 'product'
      ? `${environment.apiUrl}/uploads/products-3d`
      : `${environment.apiUrl}/uploads/sections-3d`;
    return this.http.post<{ url: string }>(endpoint, formData);
  }
}