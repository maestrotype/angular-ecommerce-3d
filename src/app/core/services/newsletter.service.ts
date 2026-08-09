import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

interface NewsletterResponse {
  success: boolean;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  private apiUrl = `${environment.apiUrl}/newsletter`;

  constructor(private http: HttpClient) {}

  subscribe(email: string): Observable<NewsletterResponse> {
    return this.http.post<NewsletterResponse>(this.apiUrl, { email });
  }
}
