import { Component, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID, HostListener, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser, CommonModule, Location } from '@angular/common';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { fixBackendUrl } from '../../core/utils/url-helper';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-three-d-viewer',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatSnackBarModule],
  template: `
    <div class="viewer-host">
      <!-- Clean Minimal 3D Loader -->
      <div class="loader-overlay" *ngIf="isLoading">
        <div class="loader-content">
          <!-- CSS Wireframe Cube -->
          <div class="cube-wrapper">
            <div class="cube">
              <div class="face front"></div>
              <div class="face back"></div>
              <div class="face right"></div>
              <div class="face left"></div>
              <div class="face top"></div>
              <div class="face bottom"></div>
            </div>
          </div>
          <div class="loader-info">
            <div class="loader-title">{{ 'VIEWER.LOADING' | translate }}</div>
            <div class="progress-track">
              <div class="progress-fill" [style.width.%]="loadingProgress"></div>
            </div>
            <div class="loader-percent">{{ loadingProgress }}%</div>
          </div>
        </div>
      </div>

      <!-- Canvas -->
      <div #container class="three-canvas" [class.ready]="!isLoading && !hasError"></div>

      <!-- Error Fallback -->
      <div class="error-overlay" *ngIf="hasError">
        <div class="error-card">
          <svg class="error-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div class="error-title">{{ 'VIEWER.LOAD_ERROR' | translate }}</div>
          <div class="error-text">
            <ng-container *ngIf="isAiGeneration; else defaultError">
              {{ 'VIEWER.AI_GENERATION_PENDING' | translate }}
            </ng-container>
            <ng-template #defaultError>
              {{ 'VIEWER.ERROR_DESCRIPTION' | translate }}
            </ng-template>
          </div>
        </div>
      </div>

      <!-- HD Toggle Button -->
      <div class="hd-toggle-container" *ngIf="hdModelPath && !isLoading && !hasError">
        <button class="hd-toggle-btn" [class.active]="isHdMode" (click)="toggleHdMode()">
          <span class="hd-icon">HD</span>
          <span class="hd-text">{{ isHdMode ? 'HD On' : 'HD Off' }}</span>
        </button>
      </div>

      <!-- Controls hint -->
      <div class="controls-hint" *ngIf="!isLoading && !previewOnly">
        <div class="hint-badge">{{ 'VIEWER.THREED_HINT' | translate }}</div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
    .viewer-host { 
      position: relative; width: 100%; height: 100%; overflow: hidden; 
      touch-action: pinch-zoom pan-x pan-y; /* Allow pinch zoom and scrolling */
    }

    /* Canvas */
    .three-canvas { width: 100%; height: 100%; opacity: 0; transition: opacity 0.8s ease; }
    .three-canvas.ready { opacity: 1; }

    /* ── LOADER ─────────────────────────────────────── */
    .loader-overlay {
      position: absolute; inset: 0; z-index: 10;
      display: flex; align-items: center; justify-content: center;
      background: var(--loader-bg, rgba(15, 23, 42, 0.9));
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      transition: background 0.3s ease;
    }

    .loader-content {
      display: flex; flex-direction: column; align-items: center; gap: 2rem;
    }

    /* Minimal CSS Wireframe Cube */
    .cube-wrapper {
      width: 60px; height: 60px;
      perspective: 800px;
    }
    
    .cube {
      width: 100%; height: 100%;
      position: relative;
      transform-style: preserve-3d;
      animation: rotate 4s infinite linear;
    }
    
    .face {
      position: absolute;
      width: 60px; height: 60px;
      border: 1px solid var(--loader-primary, rgba(99, 102, 241, 0.5));
      background: rgba(99, 102, 241, 0.05); /* Slight tint */
      box-shadow: inset 0 0 10px rgba(99, 102, 241, 0.1);
    }
    
    .front  { transform: translateZ(30px); }
    .back   { transform: rotateY(180deg) translateZ(30px); }
    .right  { transform: rotateY(90deg) translateZ(30px); }
    .left   { transform: rotateY(-90deg) translateZ(30px); }
    .top    { transform: rotateX(90deg) translateZ(30px); }
    .bottom { transform: rotateX(-90deg) translateZ(30px); }

    @keyframes rotate {
      0% { transform: rotateX(0) rotateY(0) rotateZ(0); }
      100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
    }

    /* Loader info */
    .loader-info { 
      display: flex; flex-direction: column; align-items: center; gap: 0.75rem; 
      width: 200px; 
    }
    .loader-title {
      font-size: 0.75rem; font-weight: 600; letter-spacing: 0.1em;
      color: var(--loader-text, #94a3b8);
      text-transform: uppercase;
    }
    .progress-track {
      width: 100%; height: 2px; background: var(--loader-track-bg, rgba(255,255,255,0.1));
      border-radius: 2px; overflow: hidden;
    }
    .progress-fill {
      height: 100%; border-radius: 2px;
      background: var(--loader-primary, #6366f1);
      transition: width 0.3s ease;
    }
    .loader-percent {
      font-size: 1rem; font-weight: 500;
      color: var(--loader-text-strong, #f8fafc);
    }

    /* Controls hint */
    .controls-hint {
      position: absolute; bottom: 1.25rem; left: 50%; transform: translateX(-50%);
      pointer-events: none;
    }
    .hint-badge {
      background: rgba(0,0,0,0.6); backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 20px;
      color: rgba(255,255,255,0.5); font-size: 0.65rem;
      padding: 0.4rem 0.8rem; text-align: center;
      max-width: 280px; line-height: 1.4;
      
      @media (min-width: 768px) {
        font-size: 0.75rem; padding: 0.4rem 1rem;
      }
    }

    /* Error Overlay */
    .error-overlay {
      position: absolute; inset: 0; z-index: 5;
      display: flex; align-items: center; justify-content: center;
      background: var(--loader-bg, rgba(15, 23, 42, 0.9)); 
      backdrop-filter: blur(8px);
      padding: 1rem;
    }
    .error-card {
      display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
      background: var(--error-card-bg, rgba(255, 255, 255, 0.03));
      border: 1px solid var(--error-card-border, rgba(255, 255, 255, 0.1));
      border-radius: 16px;
      padding: 2rem; text-align: center; max-width: 320px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
    .error-icon { 
      color: var(--error-icon-color, #ef4444); 
      opacity: 0.8;
      margin-bottom: 0.5rem; 
    }
    .error-title {
      font-weight: 600; font-size: 1rem; 
      color: var(--loader-text-strong, #f8fafc);
    }
    .error-text {
      font-size: 0.85rem; line-height: 1.5;
      color: var(--loader-text, #94a3b8);
    }

    /* HD Toggle */
    .hd-toggle-container {
      position: absolute; bottom: 1rem; right: 1rem; z-index: 20;
    }
    .hd-toggle-btn {
      display: flex; align-items: center; gap: 0.5rem;
      background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px;
      color: #94a3b8; font-size: 0.75rem; font-weight: 600;
      padding: 0.4rem 0.8rem; cursor: pointer; transition: all 0.2s ease;
    }
    .hd-toggle-btn:hover {
      background: rgba(15, 23, 42, 0.8);
      color: #f8fafc;
    }
    .hd-toggle-btn.active {
      background: rgba(99, 102, 241, 0.2);
      border-color: rgba(99, 102, 241, 0.5);
      color: #818cf8;
    }
    .hd-icon {
      font-weight: 800; font-size: 0.8rem; letter-spacing: 1px;
    }
    
    /* Theme support (Light / Default) */
    :host-context([data-theme="light"]), 
    :host-context([data-theme="default"]) {
      --loader-bg: rgba(255, 255, 255, 0.85);
      --loader-primary: rgba(99, 102, 241, 0.8); /* vivid indigo */
      --loader-text: #64748b;
      --loader-text-strong: #0f172a;
      --loader-track-bg: rgba(0, 0, 0, 0.08);
      
      --error-card-bg: #ffffff;
      --error-card-border: rgba(0, 0, 0, 0.08);
      
      .face {
        background: rgba(99, 102, 241, 0.03); 
        box-shadow: none;
      }
      .error-card {
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      }
    }
  `]
})
export class ThreeDViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container') container!: ElementRef;
  @Input() modelPath!: string;
  @Input() hdModelPath?: string;
  @Input() scale: [number, number, number] = [1, 1, 1];
  @Input() position: [number, number, number] = [0, 0, 0];
  @Input() previewOnly = false;
  @Input() autoRotate = true;
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

  isLoading = true;
  hasError = false;
  loadingProgress = 0;
  isAiGeneration = false;
  isHdMode = false;
  private currentLoadedPath: string | null = null;
  private isRetryingFallback = false;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private resizeObserver!: ResizeObserver;
  private model!: THREE.Object3D;
  private animId!: number;
  private isMobile = false;
  private isDestroyed = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private location: Location,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
    private http: HttpClient
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = /Mobi|Android/i.test(navigator.userAgent);
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initThree();
      
      // Determine default mode
      if (this.modelPath && this.hdModelPath) {
        this.http.get<any>(`${environment.apiUrl}/public-settings/general`).subscribe({
          next: (res) => {
            if (res.success && res.data.viewerDefaultQuality === 'hd') {
              this.isHdMode = true;
            }
            this.loadModel();
          },
          error: () => {
            this.loadModel();
          }
        });
      } else if (this.modelPath) {
        this.loadModel();
      }
      
      // Use ResizeObserver instead of window resize for more accurate container dimensions
      this.resizeObserver = new ResizeObserver(() => {
        this.onResize();
      });
      this.resizeObserver.observe(this.container.nativeElement);
    }
  }

  toggleHdMode() {
    if (!this.hdModelPath) return;
    this.isHdMode = !this.isHdMode;
    this.loadModel();
  }

  onResize() {
    if (!isPlatformBrowser(this.platformId) || !this.renderer || !this.container) return;
    const el = this.container.nativeElement;
    if (el.clientWidth === 0 || el.clientHeight === 0) return;
    
    this.camera.aspect = el.clientWidth / el.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(el.clientWidth, el.clientHeight);
  }

  private initThree() {
    const el = this.container.nativeElement;
    const w = el.clientWidth || 400;
    const h = el.clientHeight || 400;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    this.camera.position.set(0, 0, 10);

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(w, h);
    this.renderer.shadowMap.enabled = !this.isMobile;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    el.appendChild(this.renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 3);
    this.scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 4);
    key.position.set(5, 10, 7.5);
    key.castShadow = !this.isMobile;
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0x9ea7ff, 1.5);
    fill.position.set(-5, -2, -5);
    this.scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffd6e0, 1);
    rim.position.set(0, -5, -10);
    this.scene.add(rim);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = this.autoRotate;
    this.controls.autoRotateSpeed = 1.5;

    // Default to zoom disabled to allow page scroll
    this.controls.enableZoom = false;

    // Enable zoom only after user starts interacting (rotating / panning)
    this.controls.addEventListener('start', () => {
      this.controls.enableZoom = true;
    });

    if (this.isMobile) {
      // Allow 1-finger scrolling by taking rotation away from ONE finger
      this.controls.touches.ONE = null;
      // Assign TWO to DOLLY_PAN (Zoom/Pan) as usual
      this.controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
      
      // We'll use a custom listener for 3-finger rotation as OrbitControls doesn't native support it
      this.setupThreeFingerRotation();
    }

    if (this.previewOnly) {
      this.controls.enableZoom = false;
      this.controls.enablePan = false;
      this.controls.enableRotate = false;
    } else {
      // If not preview only, we might want to block wheel zoom specifically 
      // but keep pinch zoom (which is handled via touch events)
      this.renderer.domElement.addEventListener('wheel', (e) => {
        // Only block if it's a 'scroll' action, not a pinch-zoom (though wheel is usually just wheel)
        // This effectively disables mouse wheel zooming while enableZoom is true for pinch gestures
        e.stopImmediatePropagation();
      }, { passive: false });
    }
  }

  private loadModel() {
    const loader = new GLTFLoader();
    
    // Add MeshoptDecoder and DRACOLoader
    loader.setMeshoptDecoder(MeshoptDecoder);
    
    // Configure Draco Loader
    // We point to the public unpkg decoder path, as it's the most reliable without local draco files
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);
    
    const pathToLoad = this.isHdMode && this.hdModelPath ? this.hdModelPath : this.modelPath;
    
    this.isAiGeneration = !!pathToLoad && (
      pathToLoad.includes('task_') || 
      pathToLoad.includes('ai-gen') || 
      pathToLoad.includes('product3d-ai')
    );
    // AI models always export upside-down — auto-correct orientation
    this._upsideDown = this.isAiGeneration;

    if (this.currentLoadedPath === pathToLoad) return;
    
    let url = fixBackendUrl(pathToLoad);
    if (url && !url.startsWith('http')) {
      url = this.location.prepareExternalUrl(url);
    }
    
    this.isLoading = true;
    this.hasError = false;

    loader.load(
      url,
      (gltf) => {
        this.onLoadSuccess(gltf, pathToLoad);
      },
      (xhr) => {
        if (this.isDestroyed) return;
        if (xhr.lengthComputable) {
          this.loadingProgress = Math.round((xhr.loaded / xhr.total) * 100);
          this.cdr.detectChanges();
        }
      },
      (err) => {
        if (this.isDestroyed) return;
        console.error('3D load error:', err);
        
        // Fallback: If we tried to load the HD local model and it failed (e.g. file missing on this specific environment),
        // we can automatically fall back to the optimized Cloudinary model if it's different.
        const hdPath = this.hdModelPath;
        const sdPath = this.modelPath;
        
        if (this.isHdMode && hdPath && sdPath && hdPath !== sdPath) {
          console.warn('HD model failed to load. Falling back to optimized version.');
          this.isHdMode = false;
          this.loadModel();
          return;
        }

        // 2. Fallback: Localhost -> Production (for local development against production DB)
        const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        if (isLocalHost && url.includes('localhost:3002') && !this.isRetryingFallback) {
          const prodBase = 'https://angular-ecommerce-backend.onrender.com';
          const fallbackUrl = url.replace(/https?:\/\/localhost:3002/, prodBase);
          
          console.warn('Local asset missing on this machine. Attempting production fallback:', fallbackUrl);
          this.isRetryingFallback = true;
          this.isLoading = true; // Keep loading state
          this.hasError = false;

          // Attempt loading from production
          loader.load(
            fallbackUrl,
            (gltf) => {
              // Re-use the success logic (we should ideally refactor the success handler into a separate method)
              // For now, let's just trigger a successful load by setting necessary flags
              console.log('Production fallback successful!');
              this.isRetryingFallback = false;
              // We need to re-run the whole success logic. 
              // To avoid duplication, I'll call loadModel with a flag or just use the same handler.
              // Actually, the simplest way is to refactor the success callback.
              this.onLoadSuccess(gltf, fallbackUrl);
            },
            (xhr) => {
              if (xhr.lengthComputable) {
                this.loadingProgress = Math.round((xhr.loaded / xhr.total) * 100);
                this.cdr.detectChanges();
              }
            },
            (err2) => {
              console.error('Production fallback also failed:', err2);
              this.isRetryingFallback = false;
              this.isLoading = false;
              this.hasError = true;
              this.cdr.detectChanges();
            }
          );
          return;
        }

        this.isRetryingFallback = false;
        this.isLoading = false;
        this.hasError = true;
        this.cdr.detectChanges();
      }
    );
  }

  private onLoadSuccess(gltf: any, url: string) {
    if (this.isDestroyed || !this.scene) return;
    if (this.model) this.scene.remove(this.model);

    this.model = gltf.scene;
    
    // 1. Apply scale FIRST
    this.model.scale.set(this.scale[0], this.scale[1], this.scale[2]);
    
    // Apply initial rotation based on flag
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
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    
    cameraZ *= 2.0;
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

    this.model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = !this.isMobile;
        mesh.receiveShadow = !this.isMobile;
        if (!mesh.name) mesh.name = 'mesh_' + Math.random().toString(36).substr(2, 9);
        
        if (mesh.material) {
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          materials.forEach(mat => {
            if (mat && !mat.name) mat.name = 'mat_' + Math.random().toString(36).substr(2, 9);
          });
        }
      }
    });

    this.scene.add(this.model);
    this.currentLoadedPath = url;
    this.isLoading = false;
    this.cdr.detectChanges();
    this.modelLoaded.emit();
    this.animate();
  }

  private applyRotation() {
    if (!this.model) return;
    if (this._upsideDown) {
      this.model.rotation.set(Math.PI, 0, 0); 
    } else {
      this.model.rotation.set(0, 0, 0);
    }
  }

  private animate = () => {
    if (this.isDestroyed) return;
    this.animId = requestAnimationFrame(this.animate);
    if (this.controls) this.controls.update();
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  @HostListener('mouseleave')
  onMouseLeave() {
    if (this.controls && !this.previewOnly) {
      this.controls.enableZoom = false;
    }
  }

  private setupThreeFingerRotation() {
    const el = this.renderer.domElement;
    let lastX = 0;
    let lastY = 0;

    el.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches.length === 3) {
        lastX = e.touches[0].pageX;
        lastY = e.touches[0].pageY;
        // Block page scroll when 3 fingers are down
        e.preventDefault();
      }
    }, { passive: false });

    el.addEventListener('touchmove', (e: TouchEvent) => {
      if (e.touches.length === 3) {
        const deltaX = e.touches[0].pageX - lastX;
        const deltaY = e.touches[0].pageY - lastY;
        
        lastX = e.touches[0].pageX;
        lastY = e.touches[0].pageY;

        // Manually update OrbitControls rotation
        // We use the rotation logic similar to ONE finger
        const rotateScale = 0.5;
        (this.controls as any).rotateLeft(2 * Math.PI * deltaX / el.clientWidth * rotateScale);
        (this.controls as any).rotateUp(2 * Math.PI * deltaY / el.clientHeight * rotateScale);
        this.controls.update();

        
        // Block page scroll
        e.preventDefault();
        // Also enable zoom now that they started rotating
        this.controls.enableZoom = true;
      }
    }, { passive: false });
  }


  ngOnDestroy() {
    this.isDestroyed = true;
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.controls) this.controls.dispose();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      const dom = this.renderer.domElement;
      if (dom?.parentNode) dom.parentNode.removeChild(dom);
    }
    if (this.scene) {
      this.scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m: THREE.Material) => m?.dispose());
        }
      });
    }
  }
}
