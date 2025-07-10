
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Section, CreateSectionDto, UpdateSectionDto, ReorderSectionsDto } from '../models/section.model';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class SectionService {
  private apiUrl = `${environment.apiUrl}/sections`;

  constructor(private http: HttpClient) {}

  getSections(): Observable<Section[]> {
    return this.http.get<Section[]>(`${this.apiUrl}/admin`);
  }

  getActiveSections(): Observable<Section[]> {
    return this.http.get<Section[]>(this.apiUrl);
  }

  getSection(id: number): Observable<Section> {
    return this.http.get<Section>(`${this.apiUrl}/${id}`);
  }

  createSection(section: CreateSectionDto): Observable<Section> {
    return this.http.post<Section>(this.apiUrl, section);
  }

  updateSection(id: number, section: UpdateSectionDto): Observable<Section> {
    return this.http.patch<Section>(`${this.apiUrl}/${id}`, section);
  }

  deleteSection(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleSection(id: number): Observable<Section> {
    return this.http.patch<Section>(`${this.apiUrl}/${id}/toggle`, {});
  }

  reorderSections(reorderDto: ReorderSectionsDto): Observable<Section[]> {
    return this.http.post<Section[]>(`${this.apiUrl}/reorder`, reorderDto);
  }
}
