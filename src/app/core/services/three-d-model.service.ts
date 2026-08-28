import { Injectable } from '@angular/core';
import { Observable, of, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import type * as THREE from 'three';

export interface ThreeDModelLoadEvent {
  type: 'progress' | 'loaded';
  progress?: number;
  data?: any; // Loaded/cloned ThreeJS Object3D scene
}

@Injectable({
  providedIn: 'root'
})
export class ThreeDModelService {
  private modelCache = new Map<string, any>(); // Caches the original GLTF load result
  private pendingRequests = new Map<string, Observable<ThreeDModelLoadEvent>>();
  private skeletonCloneFn: ((source: any) => any) | null = null;

  constructor() { }

  /**
   * Loads a 3D model (GLTF) from a URL.
   * Leverages advanced caching, dynamic loader imports, request deduplication, and scene cloning.
   */
  loadModel(modelUrl: string): Observable<ThreeDModelLoadEvent> {
    if (this.modelCache.has(modelUrl)) {
      const gltf = this.modelCache.get(modelUrl);
      return of({ type: 'loaded', data: this.cloneScene(gltf) });
    }

    if (this.pendingRequests.has(modelUrl)) {
      return this.pendingRequests.get(modelUrl)!.pipe(
        map(event => {
          if (event.type === 'loaded') {
            return { type: 'loaded', data: this.cloneScene(event.data) };
          }
          return event;
        })
      );
    }

    const subject = new ReplaySubject<ThreeDModelLoadEvent>(1);
    const sharedObservable = subject.asObservable();
    this.pendingRequests.set(modelUrl, sharedObservable);

    this.loadAndParse(modelUrl).subscribe({
      next: (event) => {
        if (event.type === 'loaded') {
          this.modelCache.set(modelUrl, event.data); // Cache the raw/original GLTF
          this.pendingRequests.delete(modelUrl);
        }
        subject.next(event);
      },
      error: (err) => {
        this.pendingRequests.delete(modelUrl);
        subject.error(err);
      },
      complete: () => {
        subject.complete();
      }
    });

    return sharedObservable.pipe(
      map(event => {
        if (event.type === 'loaded') {
          return { type: 'loaded', data: this.cloneScene(event.data) };
        }
        return event;
      })
    );
  }

  /**
   * Dynamic loading of ThreeJS and its dependencies.
   * Splits libraries into dynamic chunks loaded only when 3D is active.
   */
  private async loadThreeDeps() {
    const [THREE, { GLTFLoader }, { DRACOLoader }, { MeshoptDecoder }, { clone }] = await Promise.all([
      import('three'),
      import('three/examples/jsm/loaders/GLTFLoader.js'),
      import('three/examples/jsm/loaders/DRACOLoader.js'),
      import('three/examples/jsm/libs/meshopt_decoder.module.js'),
      import('three/examples/jsm/utils/SkeletonUtils.js')
    ]);
    return { THREE, GLTFLoader, DRACOLoader, MeshoptDecoder, clone };
  }

  /**
   * Helper that fetches, decodes, and parses the GLTF.
   */
  private loadAndParse(modelUrl: string): Observable<ThreeDModelLoadEvent> {
    return new Observable<ThreeDModelLoadEvent>(observer => {
      let isCancelled = false;

      this.loadThreeDeps().then(({ THREE, GLTFLoader, DRACOLoader, MeshoptDecoder, clone }) => {
        if (isCancelled) return;

        this.skeletonCloneFn = clone;

        const loader = new GLTFLoader();
        loader.setMeshoptDecoder(MeshoptDecoder);
        
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        loader.setDRACOLoader(dracoLoader);

        loader.load(
          modelUrl,
          (gltf) => {
            if (isCancelled) return;
            observer.next({ type: 'loaded', data: gltf });
            observer.complete();
          },
          (xhr) => {
            if (isCancelled) return;
            if (xhr.lengthComputable) {
              const progress = Math.round((xhr.loaded / xhr.total) * 100);
              observer.next({ type: 'progress', progress });
            }
          },
          (err) => {
            if (isCancelled) return;
            observer.error(err);
          }
        );
      }).catch(err => {
        if (isCancelled) return;
        observer.error(err);
      });

      return () => {
        isCancelled = true;
      };
    });
  }

  /**
   * Clones a cached GLTF scene to prevent shared mutation issues across viewers.
   */
  private cloneScene(gltf: any): any {
    if (!gltf || !gltf.scene) return null;
    if (this.skeletonCloneFn) {
      return this.skeletonCloneFn(gltf.scene);
    }
    return gltf.scene.clone(true);
  }

  /**
   * Returns a cloned cached model scene if it exists.
   */
  getCachedModel(modelUrl: string): any {
    return this.cloneScene(this.modelCache.get(modelUrl));
  }

  /**
   * Clears the cache, making sure to dispose of GPU geometries and materials.
   */
  clearCache(): void {
    this.modelCache.forEach(gltf => {
      if (gltf && gltf.scene) {
        gltf.scene.traverse((child: any) => {
          if (child.isMesh) {
            if (child.geometry) {
              child.geometry.dispose();
            }
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat: any) => mat.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }
    });
    this.modelCache.clear();
  }

  /**
   * Checks if a model exists in the cache.
   */
  hasModel(modelUrl: string): boolean {
    return this.modelCache.has(modelUrl);
  }
}