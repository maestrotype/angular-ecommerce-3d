import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreatePageDto, Page, UpdatePageDto } from '../../shared/models/page.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PageService {
  private readonly apiUrl = `${environment.apiUrl}/pages`;

  constructor(private http: HttpClient) {}

  getPublishedPages(): Observable<Page[]> {
    return this.http.get<Page[]>(this.apiUrl);
  }

  getPagesForAdmin(): Observable<Page[]> {
    return this.http.get<Page[]>(`${this.apiUrl}/admin/all`);
  }

  getPageBySlug(slug: string): Observable<Page> {
    return this.http.get<Page>(`${this.apiUrl}/slug/${slug}`);
  }

  getPageById(id: number): Observable<Page> {
    return this.http.get<Page>(`${this.apiUrl}/admin/${id}`);
  }

  createPage(page: CreatePageDto): Observable<Page> {
    return this.http.post<Page>(this.apiUrl, page);
  }

  updatePage(id: number, page: UpdatePageDto): Observable<Page> {
    return this.http.patch<Page>(`${this.apiUrl}/${id}`, page);
  }

  deletePage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
