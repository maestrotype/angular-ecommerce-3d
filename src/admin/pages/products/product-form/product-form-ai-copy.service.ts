import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ProductFormDraft } from './product-form-draft.model';

export interface ProductAiCopyRequest extends ProductFormDraft {
  imageUrls?: string[];
  categoryLabel?: string;
}

export interface ProductAiCopyResponse extends ProductFormDraft {
  caption?: string;
  source?: 'huggingface' | 'caption-template';
}

@Injectable({ providedIn: 'root' })
export class ProductFormAiCopyService {
  constructor(private http: HttpClient) {}

  describe(payload: ProductAiCopyRequest): Observable<ProductAiCopyResponse> {
    const token = localStorage.getItem('adminToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
    return this.http.post<ProductAiCopyResponse>(`${environment.apiUrl}/ai-copy/describe`, payload, { headers });
  }
}
