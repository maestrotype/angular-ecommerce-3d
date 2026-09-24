import { Component, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef, NgZone, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { isPlatformBrowser, CommonModule, Location } from '@angular/common';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { fixBackendUrl } from '../../core/utils/url-helper';
import { resolveBundledModelPath } from '../../../shared/constants/demo-model-paths';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ThreeDModelService } from '../../core/services/three-d-model.service';
import { Subscription } from 'rxjs';

// Type-only imports to prevent bundling heavy libraries in the main chunk
import type * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-three-d-viewer',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatSnackBarModule, MatIconModule],
  templateUrl: './three-d-viewer.component.html',
  styleUrls: ['./three-d-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThreeDViewerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('container') container!: ElementRef;
  @Input() modelPath!: string;
  @Input() hdModelPath?: string;
  @Input() scale: [number, number, number] = [1, 1, 1];
  @Input() position: [number, number, number] = [0, 0, 0];
  @Input() previewOnly = false;
  @Input() autoRotate = true;
  /** Wheel/pinch zoom. Off by default so the page can scroll over the canvas. */
  @Input() enableZoom = false;
  /** Rotate only while the pointer is on this viewer; the rest of the page scrolls. */
  @Input() rotateOnHover = false;
  @Input() loading: 'lazy' | 'eager' = 'lazy'; // Support for viewport lazy-loading

  @HostBinding('class.rotate-on-hover')
  get rotateOnHoverClass(): boolean {
    return this.rotateOnHover && !this.previewOnly;
  }
  /**
   * Optional chroma-key of near-white studio plates baked into photogrammetry textures.
   * Off by default — canvas getImageData/putImageData destroys HQ texture quality.
   */
  @Input() keyOutStudioBackground: boolean | 'auto' = false;
  /** Product photo used to tint Hunyuan shape meshes that have no texture. */
  @Input() referenceImage: string | null = null;
  
  @Input() set upsideDown(value: boolean) {
    this._upsideDown = value;
    if (this.model) {
      this.applyRotation();
    }
  }
  get upsideDown(): boolean {
    return this._upsideDown;
  }
  private _upsideDown = false;

  @Output() modelLoaded = new EventEmitter<void>();

  /** Lazy viewers stay idle until visible; avoid showing 0% on hidden 0×0 hosts. */
  isLoading = false;
  hasError = false;
  loadingProgress = 0;
  isAiGeneration = false;
  isHdMode = false;
  lastErrorDetails: any = null;
  failedUrl = '';
  showLogs = false;
  private currentLoadedPath: string | null = null;
  private bareMaterials: any[] = [];
  private isRetryingFallback = false;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private modelSubscription: Subscription | null = null;
  private model!: THREE.Object3D;
  private animId!: number;
  private isMobile = false;
  private isDestroyed = false;
  private isInitializing = false;
  private isInViewport = false;
  private isLooping = false;
  private isInteracting = false;
  private mobileTouchCleanup: (() => void) | null = null;
  private hoverCleanup: (() => void) | null = null;
  private dampingStopTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private location: Location,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private http: HttpClient,
    private ngZone: NgZone,
    private threeDModelService: ThreeDModelService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        /Mobi|Android/i.test(navigator.userAgent);
    }
  }

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.setupSizeObserver();
    if (this.loading === 'eager') {
      this.isInViewport = true;
      this.tryInitializeViewer();
    }
    this.setupViewportObserver();
    document.addEventListener('visibilitychange', this.onVisibility);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.syncViewportNow());
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['modelPath'] && !changes['modelPath'].firstChange) {
      if (this.renderer) {
        this.loadModel();
      } else {
        this.tryInitializeViewer();
      }
    }
    if (changes['autoRotate'] && this.controls) {
      this.controls.autoRotate = !!this.autoRotate;
      if (this.autoRotate) {
        this.resumeLoop();
      }
    }
  }

  /**
   * Lazy-init when first visible, and pause the render loop once the viewer leaves the screen.
   */
  private setupViewportObserver() {
    const options = {
      root: null,
      rootMargin: '80px',
      threshold: 0.01
    };

    this.ngZone.runOutsideAngular(() => {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          this.isInViewport = entry.isIntersecting;
          if (entry.isIntersecting) {
            this.tryInitializeViewer();
            this.resumeLoop();
          } else {
            this.pauseLoop();
          }
        });
      }, options);

      this.intersectionObserver.observe(this.container.nativeElement);
    });
  }

  private onVisibility = () => {
    if (typeof document === 'undefined') {
      return;
    }
    if (document.hidden) {
      this.pauseLoop();
    } else if (this.isInViewport) {
      this.resumeLoop();
    }
  };

  private syncViewportNow(): void {
    if (this.isDestroyed || !this.container?.nativeElement) {
      return;
    }
    const rect = this.container.nativeElement.getBoundingClientRect();
    const inView =
      rect.width > 0 &&
      rect.height > 0 &&
      rect.bottom > 0 &&
      rect.top < (window.innerHeight || 0) + 80;
    this.isInViewport = inView;
    if (inView) {
      this.tryInitializeViewer();
      this.resumeLoop();
    } else {
      this.pauseLoop();
    }
  }

  private disconnectObserver() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
  }

  /**
   * Retry init when the host gets a real layout box (e.g. after *ngIf swap from
   * the generating placeholder). Must exist before the WebGL renderer does.
   */
  private setupSizeObserver() {
    if (!this.container?.nativeElement || this.resizeObserver) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.isDestroyed) {
          return;
        }
        if (!this.renderer) {
          this.tryInitializeViewer();
          return;
        }
        this.onResize();
      });
      this.resizeObserver.observe(this.container.nativeElement);
    });
  }

  /** Returns false when the host has no layout box yet (e.g. display:none). */
  private tryInitializeViewer(): boolean {
    if (this.isDestroyed || this.isInitializing || !this.container?.nativeElement || this.renderer) {
      return !!this.renderer;
    }

    const el = this.container.nativeElement;
    if (el.clientWidth <= 0 || el.clientHeight <= 0) {
      return false;
    }

    this.initializeViewer();
    return true;
  }

  private initializeViewer() {
    if (this.isDestroyed || this.isInitializing || !this.container?.nativeElement || this.renderer) {
      return;
    }

    this.isInitializing = true;

    this.ngZone.run(() => {
      this.isLoading = true;
      this.loadingProgress = 0;
      this.cdr.markForCheck();
    });

    this.ngZone.runOutsideAngular(async () => {
      try {
        const THREE = await import('three');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

        if (this.isDestroyed) {
          this.isInitializing = false;
          return;
        }
        if (this.renderer) {
          this.isInitializing = false;
          return;
        }

        this.initThreeWithDeps(THREE, OrbitControls);
        this.isInitializing = false;
        this.setupSizeObserver();
        this.onResize();

        // Run checkAndLoad in zone since it updates loading/quality states
        this.ngZone.run(() => {
          this.checkAndLoad();
        });
      } catch (err) {
        this.isInitializing = false;
        console.error('Failed to initialize 3D viewer libraries:', err);
        this.ngZone.run(() => {
          this.isLoading = false;
          this.hasError = true;
          this.lastErrorDetails = err;
          this.cdr.markForCheck();
        });
      }
    });
  }

  private checkAndLoad() {
    if (this.modelPath && this.hdModelPath) {
      this.http.get<any>(`${environment.apiUrl}/public-settings/general`).subscribe({
        next: (res) => {
          if (res.success && res.data.viewerDefaultQuality === 'hd') {
            this.isHdMode = true;
          }
          this.loadModel();
        },
        error: () => this.loadModel()
      });
    } else if (this.modelPath) {
      this.loadModel();
    }
  }

  /**
   * Build the URL to fetch the 3D model, trying the new API endpoint
   * for local models before falling back to the direct URL.
   */
  private buildModelUrl(pathToLoad: string): string {
    // If it's already a full URL (Cloudinary, etc), return as-is
    if (pathToLoad.startsWith('http')) {
      return pathToLoad;
    }

    // Extract product ID from the path (e.g., "/uploads/products-3d/123-model.glb" -> 123)
    const pathParts = pathToLoad.split('/');
    const productIdStr = pathParts.find(part => /^\d+$/.test(part));
    
    if (productIdStr) {
      const productId = parseInt(productIdStr, 10);
      // Try the new API endpoint first
      return `${environment.apiUrl}/products/${productId}/3d-model`;
    }

    // If no product ID found, use the original URL preparation
    let url = fixBackendUrl(pathToLoad);
    if (url && !url.startsWith('http') && url.startsWith('/uploads/')) {
      const apiBase = environment.apiUrl;
      const backendBaseUrl = apiBase.endsWith('/api') ? apiBase.substring(0, apiBase.length - 4) : apiBase;
      url = `${backendBaseUrl}${url}`;
    } else if (url && !url.startsWith('http')) {
      url = this.location.prepareExternalUrl(url);
    }
    return url;
  }

  toggleHdMode() {
    if (!this.hdModelPath) return;
    this.isHdMode = !this.isHdMode;
    this.loadModel();
  }

  onResize() {
    if (!isPlatformBrowser(this.platformId) || !this.renderer || !this.container) return;
    const el = this.container.nativeElement;
    if (el.clientWidth <= 0 || el.clientHeight <= 0) return;
    
    this.camera.aspect = el.clientWidth / el.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(el.clientWidth, el.clientHeight);
    this.renderFrame();
  }

  private initThreeWithDeps(THREE: any, OrbitControls: any) {
    const el = this.container.nativeElement;
    const w = el.clientWidth || 400;
    const h = el.clientHeight || 400;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    this.camera.position.set(0, 0, 10);

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: false,
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(w, h);
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.background = 'transparent';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.touchAction = 'none';
    this.renderer.shadowMap.enabled = !this.isMobile;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    el.appendChild(this.renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 2.5);
    this.scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 3.5);
    key.position.set(5, 10, 7.5);
    key.castShadow = !this.isMobile;
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0x9ea7ff, 1);
    fill.position.set(-5, -2, -5);
    this.scene.add(fill);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = !!this.autoRotate;
    this.controls.autoRotateSpeed = 1.2;
    this.controls.enableZoom = this.enableZoom && !this.previewOnly;
    this.controls.enablePan = !this.previewOnly;
    this.controls.enableRotate = !this.previewOnly && !this.rotateOnHover;

    this.controls.addEventListener('start', () => {
      this.isInteracting = true;
      this.resumeLoop();
    });
    this.controls.addEventListener('end', () => {
      this.isInteracting = false;
      if (this.rotateOnHover && this.controls) {
        this.controls.enableRotate = false;
      }
      this.armDampingStop();
    });

    if (this.isMobile && !this.previewOnly && !this.rotateOnHover) {
      this.controls.touches.ONE = THREE.TOUCH.ROTATE;
      this.controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
      this.setupMobileTouchGuards();
    }

    if (this.previewOnly) {
      this.controls.enableZoom = false;
      this.controls.enablePan = false;
      this.controls.enableRotate = false;
    } else if (this.rotateOnHover) {
      this.setupHoverRotate(this.container.nativeElement);
    }
  }

  /**
   * Subscribes to the advanced cached loading service.
   */
  private loadModel() {
    const rawPath = this.isHdMode && this.hdModelPath ? this.hdModelPath : this.modelPath;
    const pathToLoad = resolveBundledModelPath(rawPath);
    
    const lowerPath = (pathToLoad || '').toLowerCase();
    this.isAiGeneration = !!pathToLoad && (
      lowerPath.includes('task_') ||
      lowerPath.includes('ai-gen') ||
      lowerPath.includes('product3d-ai') ||
      lowerPath.includes('huggingface') ||
      lowerPath.includes('triposr') ||
      /(?:^|\/)hy-/.test(lowerPath)
    );

    // Old Tripo3D GLBs were exported inverted. Hugging Face TripoSR is already Y-up.
    const isHuggingFaceModel =
      lowerPath.includes('huggingface') ||
      lowerPath.includes('triposr') ||
      /(?:^|\/)hf-/.test(lowerPath);
    this._upsideDown = this.isAiGeneration && !isHuggingFaceModel;

    if (this.currentLoadedPath === pathToLoad && this.model) return;
    
    // Use buildModelUrl to resolve the URL (tries API endpoint for local models first)
    const url = this.buildModelUrl(pathToLoad);
    
    this.isLoading = true;
    this.hasError = false;
    this.lastErrorDetails = null;
    this.failedUrl = pathToLoad || '';
    this.cdr.markForCheck();

    if (this.modelSubscription) {
      this.modelSubscription.unsubscribe();
    }

    this.modelSubscription = this.threeDModelService.loadModel(url).subscribe({
      next: (event) => {
        if (this.isDestroyed) return;
        if (event.type === 'progress') {
          this.loadingProgress = event.progress || 0;
          this.cdr.markForCheck();
        } else if (event.type === 'loaded') {
          this.ngZone.runOutsideAngular(async () => {
            const THREE = await import('three');
            this.onLoadSuccess(event.data, pathToLoad, THREE);
          });
        }
      },
      error: (err) => {
        if (this.isDestroyed) return;
        console.error('3D load error:', err);
        
        if (this.isHdMode && this.hdModelPath && this.modelPath && this.hdModelPath !== this.modelPath) {
          this.ngZone.run(() => {
            this.isHdMode = false;
            this.loadModel();
          });
          return;
        }

        const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        if (isLocalHost && url.includes('localhost:3002') && !this.isRetryingFallback) {
          const prodBase = 'https://angular-ecommerce-backend.onrender.com';
          const fallbackUrl = url.replace(/https?:\/\/localhost:3002/, prodBase);
          this.isRetryingFallback = true;
          
          this.ngZone.run(() => {
            this.isLoading = true;
            this.hasError = false;
            this.cdr.markForCheck();
          });

          this.modelSubscription = this.threeDModelService.loadModel(fallbackUrl).subscribe({
            next: (fbEvent) => {
              if (this.isDestroyed) return;
              if (fbEvent.type === 'progress') {
                this.loadingProgress = fbEvent.progress || 0;
                this.cdr.markForCheck();
              } else if (fbEvent.type === 'loaded') {
                this.ngZone.runOutsideAngular(async () => {
                  const THREE = await import('three');
                  this.onLoadSuccess(fbEvent.data, fallbackUrl, THREE);
                });
              }
            },
            error: (fallbackErr) => {
              this.ngZone.run(() => {
                this.isRetryingFallback = false;
                this.isLoading = false;
                this.hasError = true;
                this.lastErrorDetails = fallbackErr;
                this.failedUrl = fallbackUrl;
                this.cdr.markForCheck();
              });
            }
          });
          return;
        }

        this.ngZone.run(() => {
          this.isLoading = false;
          this.hasError = true;
          this.lastErrorDetails = err;
          this.failedUrl = url;
          this.cdr.markForCheck();
        });
      }
    });
  }

  toggleLogs() {
    this.showLogs = !this.showLogs;
    this.cdr.markForCheck();
  }

  getErrorString(): string {
    if (!this.lastErrorDetails) return 'Unknown load error';
    
    if (this.lastErrorDetails && typeof this.lastErrorDetails === 'object') {
      const target = this.lastErrorDetails.target;
      if (target && ('status' in target || 'statusText' in target)) {
        return `HTTP ${target.status} ${target.statusText || ''}`.trim() || `Network/HTTP error (status: ${target.status})`;
      }
    }

    if (this.lastErrorDetails.message) {
      return this.lastErrorDetails.message;
    }
    
    if (typeof this.lastErrorDetails === 'string') {
      return this.lastErrorDetails;
    }
    
    return 'Failed to compile or load 3D model asset';
  }

  getAdvice(): string {
    const url = this.failedUrl || '';
    const isLiveSite = typeof window !== 'undefined' &&
      !window.location.hostname.includes('localhost') &&
      !window.location.hostname.includes('127.0.0.1');

    if (url.includes('localhost') && isLiveSite) {
      return this.translate.instant('VIEWER.LOCALHOST_ON_LIVE_ADVICE');
    }
    if (url.includes('onrender.com') && url.includes('/uploads/')) {
      return this.translate.instant('VIEWER.RENDER_EPHEMERAL_ADVICE');
    }
    if (url.includes('localhost:3002') || url.includes('127.0.0.1:3002')) {
      return this.translate.instant('VIEWER.LOCAL_BACKEND_ADVICE');
    }
    if (url.includes('res.cloudinary.com')) {
      return this.translate.instant('VIEWER.CLOUDINARY_LOAD_ADVICE');
    }
    return '';
  }

  private onLoadSuccess(modelScene: any, url: string, THREE: any) {
    if (this.isDestroyed || !this.scene) return;
    
    // Dispose memory of old model before setting the new one
    this.disposeModel();
    if (this.model) this.scene.remove(this.model);

    this.model = modelScene;
    this.model.scale.set(this.scale[0], this.scale[1], this.scale[2]);
    this.prepareBareShapeMesh(THREE);
    this.applyRotation();
    this.model.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(this.model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    this.model.position.x += (this.position[0] - center.x);
    this.model.position.y += (this.position[1] - center.y);
    this.model.position.z += (this.position[2] - center.z);
    this.model.updateMatrixWorld(true);
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 2.0;
    
    this.camera.position.set(this.position[0], this.position[1], cameraZ);
    this.camera.near = maxDim * 0.01;
    this.camera.far = maxDim * 100;
    this.camera.updateProjectionMatrix();
    
    if (this.controls) {
      this.controls.target.set(this.position[0], this.position[1], this.position[2]);
      this.controls.minDistance = cameraZ * 0.2;
      this.controls.maxDistance = cameraZ * 5;
      this.controls.update();
    }

    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.model.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = !this.isMobile;
        child.receiveShadow = !this.isMobile;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        for (const material of materials) {
          if (material?.map) {
            material.map.anisotropy = maxAnisotropy;
            material.map.needsUpdate = true;
          }
        }
      }
    });

    if (this.shouldKeyOutStudioBackground()) {
      this.removeStudioBackgroundFromTextures(THREE);
    }

    this.scene.add(this.model);
    this.currentLoadedPath = url;
    this.syncViewportNow();
    this.renderFrame();

    this.ngZone.run(() => {
      this.isLoading = false;
      this.cdr.markForCheck();
      this.modelLoaded.emit();
    });

    this.ngZone.runOutsideAngular(() => this.resumeLoop());
  }

  private setupHoverRotate(host: HTMLElement): void {
    const onEnter = () => {
      if (!this.controls || this.previewOnly) {
        return;
      }
      this.controls.enableRotate = true;
    };
    const onLeave = () => {
      if (!this.controls || this.isInteracting) {
        return;
      }
      this.controls.enableRotate = false;
    };
    const onDown = () => {
      if (!this.controls || this.previewOnly) {
        return;
      }
      this.controls.enableRotate = true;
    };
    host.addEventListener('pointerenter', onEnter);
    host.addEventListener('pointerleave', onLeave);
    host.addEventListener('pointerdown', onDown);
    this.hoverCleanup = () => {
      host.removeEventListener('pointerenter', onEnter);
      host.removeEventListener('pointerleave', onLeave);
      host.removeEventListener('pointerdown', onDown);
    };
  }

  /**
   * Public Hunyuan Spaces return a white shape with no texture maps.
   * Stand that mesh up and project the product photo onto its side.
   */
  private prepareBareShapeMesh(THREE: typeof import('three')): void {
    if (!this.model) {
      return;
    }
    this.bareMaterials = [];
    const sourceUrl = `${this.modelPath || ''} ${this.currentLoadedPath || ''}`;
    let hunyuanShape = /(?:^|[^a-z0-9])hy-/i.test(sourceUrl);
    this.model.traverse((child: any) => {
      if (!child.isMesh) {
        return;
      }
      if (JSON.stringify(child.userData || {}).toLowerCase().includes('hunyuan')) {
        hunyuanShape = true;
      }
      if (child.geometry && !child.geometry.getAttribute('normal')) {
        child.geometry.computeVertexNormals();
      }
    });
    if (!hunyuanShape) {
      return;
    }
    // Hunyuan already stands sole-down. The extra 180° turn put the sole on top.
    this._upsideDown = false;
    this.model.traverse((child: any) => {
      if (!child.isMesh || !child.geometry) {
        return;
      }
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      if (materials.some((material: any) => material?.map)) {
        return;
      }
      child.geometry.computeBoundingBox();
      const box = child.geometry.boundingBox;
      const size = new THREE.Vector3(
        Math.max(box.max.x - box.min.x, 1e-4),
        Math.max(box.max.y - box.min.y, 1e-4),
        Math.max(box.max.z - box.min.z, 1e-4),
      );
      const uniforms = {
        uBoxMin: { value: box.min.clone() },
        uBoxSize: { value: size },
        uShoeMap: { value: new THREE.Texture() },
      };
      const textured = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.9,
        metalness: 0,
        side: THREE.DoubleSide,
        envMapIntensity: 0.2,
      });
      textured.onBeforeCompile = (shader) => {
        shader.uniforms.uBoxMin = uniforms.uBoxMin;
        shader.uniforms.uBoxSize = uniforms.uBoxSize;
        shader.uniforms.uShoeMap = uniforms.uShoeMap;
        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', '#include <common>\nvarying vec3 vObjPos;\nvarying vec3 vObjNormal;')
          .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nvObjNormal = objectNormal;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvObjPos = transformed;');
        shader.fragmentShader = shader.fragmentShader
          .replace(
            '#include <common>',
            '#include <common>\nvarying vec3 vObjPos;\nvarying vec3 vObjNormal;\nuniform vec3 uBoxMin;\nuniform vec3 uBoxSize;\nuniform sampler2D uShoeMap;',
          )
          .replace('#include <map_fragment>', `
            vec3 triN = normalize(abs(vObjNormal));
            triN = pow(triN, vec3(3.0));
            triN /= max(triN.x + triN.y + triN.z, 0.0001);
            vec2 uvX = vec2(vObjPos.z, vObjPos.y);
            vec2 uvY = vec2(vObjPos.x, vObjPos.z);
            vec2 uvZ = vec2(vObjPos.x, vObjPos.y);
            uvX = (uvX - uBoxMin.zy) / uBoxSize.zy;
            uvY = (uvY - uBoxMin.xz) / uBoxSize.xz;
            uvZ = (uvZ - uBoxMin.xy) / uBoxSize.xy;
            vec4 shoeColor = texture2D(uShoeMap, uvX) * triN.x
              + texture2D(uShoeMap, uvY) * triN.y
              + texture2D(uShoeMap, uvZ) * triN.z;
            diffuseColor *= shoeColor;
          `);
      };
      (textured as any).userData.shoeUniforms = uniforms;
      // A placeholder map keeps the standard shader's texture path compiling.
      textured.map = new THREE.Texture();
      child.material = textured;
      this.bareMaterials.push(textured);
    });
    this.applyReferenceTexture(THREE);
  }

  private applyReferenceTexture(THREE: typeof import('three')): void {
    const src = this.referenceImage;
    if (!src || !this.bareMaterials.length) {
      for (const material of this.bareMaterials) {
        material.color.set(0x3f3f46);
      }
      return;
    }
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      src,
      (source) => {
        const image = source.image as HTMLImageElement | undefined;
        const texture = image ? this.cropShoeTexture(THREE, image) : source;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.needsUpdate = true;
        for (const material of this.bareMaterials) {
          const uniforms = material.userData?.shoeUniforms;
          if (uniforms) {
            uniforms.uShoeMap.value = texture;
          }
          material.map = texture;
          material.color.set(0xffffff);
          material.needsUpdate = true;
        }
        this.renderFrame();
      },
      undefined,
      () => {
        for (const material of this.bareMaterials) {
          material.color.set(0x3f3f46);
          material.needsUpdate = true;
        }
        this.renderFrame();
      },
    );
  }

  /** Drop empty margins so the shoe photo fills the mesh instead of a small patch. */
  private cropShoeTexture(THREE: typeof import('three'), image: HTMLImageElement): import('three').Texture {
    const source = document.createElement('canvas');
    source.width = image.naturalWidth || image.width;
    source.height = image.naturalHeight || image.height;
    const sourceCtx = source.getContext('2d', { willReadFrequently: true });
    if (!sourceCtx || !source.width || !source.height) {
      return new THREE.CanvasTexture(image);
    }
    sourceCtx.drawImage(image, 0, 0, source.width, source.height);
    let pixels: ImageData;
    try {
      pixels = sourceCtx.getImageData(0, 0, source.width, source.height);
    } catch {
      return new THREE.CanvasTexture(image);
    }
    let minX = source.width;
    let minY = source.height;
    let maxX = 0;
    let maxY = 0;
    const data = pixels.data;
    for (let y = 0; y < source.height; y++) {
      for (let x = 0; x < source.width; x++) {
        const i = (y * source.width + x) * 4;
        const alpha = data[i + 3];
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const empty = alpha < 24 || (r > 242 && g > 242 && b > 242);
        if (empty) {
          continue;
        }
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
    if (maxX <= minX || maxY <= minY) {
      return new THREE.CanvasTexture(image);
    }
    const pad = 2;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(source.width - 1, maxX + pad);
    maxY = Math.min(source.height - 1, maxY + pad);
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    const cropped = document.createElement('canvas');
    cropped.width = width;
    cropped.height = height;
    const croppedCtx = cropped.getContext('2d');
    if (!croppedCtx) {
      return new THREE.CanvasTexture(image);
    }
    croppedCtx.fillStyle = '#1c1c1c';
    croppedCtx.fillRect(0, 0, width, height);
    croppedCtx.drawImage(source, minX, minY, width, height, 0, 0, width, height);
    const texture = new THREE.CanvasTexture(cropped);
    texture.flipY = true;
    return texture;
  }

  private applyRotation() {
    if (!this.model) return;
    if (this._upsideDown) {
      this.model.rotation.set(Math.PI, 0, 0); 
    } else {
      this.model.rotation.set(0, 0, 0);
    }
  }

  private shouldKeyOutStudioBackground(): boolean {
    if (this.keyOutStudioBackground === false) {
      return false;
    }
    if (this.keyOutStudioBackground === true) {
      return true;
    }

    let hasPhotoScanMesh = false;
    this.model.traverse((child: any) => {
      if (child.isMesh && child.name?.includes('texture_pbr')) {
        hasPhotoScanMesh = true;
      }
    });
    return hasPhotoScanMesh;
  }

  /**
   * Photogrammetry demo GLBs bake a white/grey studio plate into baseColor.
   * Make those pixels transparent so the themed viewer background shows through.
   */
  private removeStudioBackgroundFromTextures(THREE: typeof import('three')): void {
    if (!this.model) {
      return;
    }

    const hardCutoff = 238;
    const softCutoff = 210;

    this.model.traverse((child: any) => {
      if (!child.isMesh || !child.material) {
        return;
      }

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const material of materials) {
        const mat = material as {
          map?: { image?: CanvasImageSource; colorSpace?: unknown };
          transparent?: boolean;
          alphaTest?: number;
          needsUpdate?: boolean;
        };
        const sourceImage = mat.map?.image as (HTMLImageElement & { width?: number; height?: number }) | undefined;
        const width = sourceImage?.width ?? 0;
        const height = sourceImage?.height ?? 0;
        if (!sourceImage || width <= 0 || height <= 0) {
          continue;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          continue;
        }

        ctx.drawImage(sourceImage, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;

        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const minChannel = Math.min(r, g, b);

          if (minChannel >= hardCutoff) {
            pixels[i + 3] = 0;
            continue;
          }

          if (minChannel >= softCutoff) {
            const feather = (hardCutoff - minChannel) / (hardCutoff - softCutoff);
            pixels[i + 3] = Math.round(pixels[i + 3] * feather);
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const keyedTexture = new THREE.CanvasTexture(canvas);
        keyedTexture.colorSpace = THREE.SRGBColorSpace;
        mat.map = keyedTexture;
        mat.transparent = true;
        mat.alphaTest = 0.04;
        mat.needsUpdate = true;
      }
    });
  }

  private shouldLoop(): boolean {
    if (this.isDestroyed || !this.renderer || !this.isInViewport) {
      return false;
    }
    if (typeof document !== 'undefined' && document.hidden) {
      return false;
    }
    return !!this.autoRotate || this.isInteracting;
  }

  private resumeLoop(): void {
    if (this.isDestroyed || this.isLooping || !this.renderer) {
      return;
    }
    if (!this.shouldLoop()) {
      this.renderFrame();
      return;
    }
    this.isLooping = true;
    this.ngZone.runOutsideAngular(() => this.animate());
  }

  private pauseLoop(): void {
    this.isLooping = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = 0 as unknown as number;
    }
    if (!this.isDestroyed) {
      this.renderFrame();
    }
  }

  private armDampingStop(): void {
    if (this.dampingStopTimer) {
      clearTimeout(this.dampingStopTimer);
    }
    this.dampingStopTimer = setTimeout(() => {
      this.dampingStopTimer = null;
      if (!this.shouldLoop()) {
        this.pauseLoop();
      }
    }, 450);
  }

  private renderFrame(): void {
    if (this.controls) {
      this.controls.update();
    }
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  private animate = () => {
    if (this.isDestroyed || !this.isLooping) {
      return;
    }
    if (!this.shouldLoop()) {
      this.renderFrame();
      this.isLooping = false;
      return;
    }
    this.animId = requestAnimationFrame(this.animate);
    this.renderFrame();
  };

  private setupMobileTouchGuards(): void {
    const el = this.renderer.domElement;
    const host = this.container.nativeElement as HTMLElement;

    host.style.touchAction = 'none';

    const stopScroll = (event: TouchEvent) => {
      if (this.previewOnly) {
        return;
      }
      event.stopPropagation();
    };

    el.addEventListener('touchstart', stopScroll, { passive: true });
    el.addEventListener('touchmove', stopScroll, { passive: false });

    this.mobileTouchCleanup = () => {
      el.removeEventListener('touchstart', stopScroll);
      el.removeEventListener('touchmove', stopScroll);
      host.style.touchAction = '';
    };
  }

  /**
   * Traverses the model and disposes of all geometries and materials.
   * Crucial to prevent severe WebGL / GPU context and memory leaks.
   */
  private disposeModel() {
    if (this.model) {
      this.model.traverse((child: any) => {
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
  }

  ngOnDestroy() {
    this.isDestroyed = true;
    this.mobileTouchCleanup?.();
    this.hoverCleanup?.();
    if (this.dampingStopTimer) {
      clearTimeout(this.dampingStopTimer);
    }
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('visibilitychange', this.onVisibility);
    }
    this.disconnectObserver();
    this.pauseLoop();
    if (this.modelSubscription) {
      this.modelSubscription.unsubscribe();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.controls) this.controls.dispose();
    this.disposeModel();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      const dom = this.renderer.domElement;
      if (dom?.parentNode) dom.parentNode.removeChild(dom);
    }
  }
}
