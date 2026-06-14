import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ThreeDModelService {
  private modelCache = new Map<string, any>();
  private loadingModels = new Set<string>();

  constructor() { }

  loadModel(modelUrl: string): Observable<any> {
    if (this.modelCache.has(modelUrl)) {
      return of(this.modelCache.get(modelUrl));
    }

    if (this.loadingModels.has(modelUrl)) {
      return of(null);
    }

    this.loadingModels.add(modelUrl);

    return new Observable(observer => {
      try {
        const modelData = {
          url: modelUrl,
          loadedAt: Date.now(),
          size: Math.floor(Math.random() * 1000) + 500,
          status: 'loaded'
        };

        this.modelCache.set(modelUrl, modelData);
        this.loadingModels.delete(modelUrl);
        
        observer.next(modelData);
        observer.complete();
      } catch (error) {
        this.loadingModels.delete(modelUrl);
        console.error('Error loading 3D model:', error);
        observer.error(error);
      }
    }).pipe(
      catchError(error => {
        this.loadingModels.delete(modelUrl);
        console.error('Error loading 3D model:', error);
        return of(null);
      })
    );
  }

  getCachedModel(modelUrl: string): any {
    return this.modelCache.get(modelUrl);
  }

  clearCache(): void {
    this.modelCache.clear();
  }

  hasModel(modelUrl: string): boolean {
    return this.modelCache.has(modelUrl);
  }
}