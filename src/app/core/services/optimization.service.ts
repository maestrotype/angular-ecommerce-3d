import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, distinctUntilChanged, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OptimizationService {
  private cache = new Map<string, any>();
  private memoizedFunctions = new Map<string, Function>();

  /**
   * Alternative useMemo 
   */
  memoize<T>(key: string, computation: () => T, dependencies: any[] = []): T {
    const dependencyKey = JSON.stringify(dependencies);
    const cacheKey = `${key}:${dependencyKey}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const result = computation();
    this.cache.set(cacheKey, result);
    return result;
  }

  /**
   * Alternative useCallback
   */
  useCallback<T extends (...args: any[]) => any>(
    key: string, 
    callback: T, 
    dependencies: any[] = []
  ): T {
    const dependencyKey = JSON.stringify(dependencies);
    const cacheKey = `${key}:${dependencyKey}`;
    
    if (this.memoizedFunctions.has(cacheKey)) {
      return this.memoizedFunctions.get(cacheKey) as T;
    }
    
    this.memoizedFunctions.set(cacheKey, callback);
    return callback;
  }

  /**
   * Memoisation for RxJS Observable
   */
  memoizeObservable<T>(
    key: string, 
    observable: Observable<T>, 
    dependencies: any[] = []
  ): Observable<T> {
    const dependencyKey = JSON.stringify(dependencies);
    const cacheKey = `${key}:${dependencyKey}`;
    
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey));
    }
    
    return observable.pipe(
      map(result => {
        this.cache.set(cacheKey, result);
        return result;
      }),
      shareReplay(1)
    );
  }

  clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  clearMemoizedFunctions(pattern?: string): void {
    if (pattern) {
      for (const key of this.memoizedFunctions.keys()) {
        if (key.includes(pattern)) {
          this.memoizedFunctions.delete(key);
        }
      }
    } else {
      this.memoizedFunctions.clear();
    }
  }

  getCacheStats(): { cacheSize: number; memoizedFunctionsSize: number } {
    return {
      cacheSize: this.cache.size,
      memoizedFunctionsSize: this.memoizedFunctions.size
    };
  }
} 