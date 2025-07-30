import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { Section, CreateSectionDto, UpdateSectionDto, ReorderSectionsDto } from '../models/section.model';
import { environment } from '../../environments/environment.prod';
import { ModalService } from '../../app/core/services/modal.service';

@Injectable({
  providedIn: 'root'
})
export class SectionService {
  private apiUrl = `${environment.apiUrl}/sections`;

  constructor(
    private http: HttpClient,
    private modalService: ModalService
  ) {}

  getSections(): Observable<Section[]> {
    return this.http.get<Section[]>(`${this.apiUrl}/admin`).pipe(
      catchError(error => {
        this.modalService.showError('Error', 'Failed to load sections', error.message, 'admin');
        throw error;
      })
    );
  }

  getActiveSections(): Observable<Section[]> {
    return this.http.get<Section[]>(this.apiUrl).pipe(
      catchError(error => {
        this.modalService.showError('Error', 'Failed to load active sections', error.message, 'admin');
        throw error;
      })
    );
  }

  getSection(id: number): Observable<Section> {
    return this.http.get<Section>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        this.modalService.showError('Error', 'Failed to load section', error.message, 'admin');
        throw error;
      })
    );
  }

  createSection(section: CreateSectionDto): Observable<Section> {
    return this.http.post<Section>(this.apiUrl, section).pipe(
      catchError(error => {
        this.modalService.showError('Error', 'Failed to create section', error.message, 'admin');
        throw error;
      })
    );
  }

  updateSection(id: number, section: UpdateSectionDto): Observable<Section> {
    return this.http.patch<Section>(`${this.apiUrl}/${id}`, section).pipe(
      catchError(error => {
        this.modalService.showError('Error', 'Failed to update section', error.message, 'admin');
        throw error;
      })
    );
  }

  deleteSection(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        this.modalService.showError('Error', 'Failed to delete section', error.message, 'admin');
        throw error;
      })
    );
  }

  toggleSection(id: number): Observable<Section> {
    return this.http.patch<Section>(`${this.apiUrl}/${id}/toggle`, {}).pipe(
      catchError(error => {
        this.modalService.showError('Error', 'Failed to toggle section', error.message, 'admin');
        throw error;
      })
    );
  }

  reorderSections(sectionIds: number[]): Observable<Section[]> {
    return this.http.post<Section[]>(`${this.apiUrl}/reorder`, { sectionIds }).pipe(
      catchError(error => {
        this.modalService.showError('Error', 'Failed to reorder sections', error.message, 'admin');
        throw error;
      })
    );
  }

  uploadImage(file: File): Observable<{url: string}> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{url: string}>(`${environment.apiUrl}/uploads/sections`, formData).pipe(
      catchError(error => {
        this.modalService.showError('Error', 'Failed to upload image', error.message, 'admin');
        throw error;
      })
    );
  }

  upload3dModel(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('model', file);
    return this.http.post<{ url: string }>(
      `${environment.apiUrl}/uploads/sections-3d`,
      formData
    ).pipe(
      catchError(error => {
        this.modalService.showError('Error', 'Failed to upload 3D model', error.message, 'admin');
        throw error;
      })
    );
  }
}