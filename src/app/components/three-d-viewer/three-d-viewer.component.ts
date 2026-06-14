import { Component, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID, HostListener, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser, CommonModule, Location } from '@angular/common';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { fixBackendUrl } from '../../core/utils/url-helper';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-three-d-viewer',
  standalone: true,
  imports: [CommonModule, TranslateModule, MatSnackBarModule, MatIconModule],
  template: `
    <div class="viewer-host">
      <!-- Premium Glass Loader -->
      <div class="loader-overlay" *ngIf="isLoading">
        <div class="loader-content">
          <div class="spinner-container">
            <div class="glass-ring"></div>
            <div class="accent-ring"></div>
            <div class="core-dot"></div>
          </div>
          <div class="loader-info">
            <div class="loader-title">{{ 'VIEWER.LOADING' | translate }}</div>
            <div class="progress-container">
              <div class="progress-bar" [style.width.%]="loadingProgress"></div>
            </div>
            <div class="loader-percent">{{ loadingProgress }}%</div>
          </div>
        </div>
      </div>

      <!-- Canvas -->
      <div #container class="three-canvas" [class.ready]="!isLoading && !hasError"></div>

      <!-- Beautiful Error Card -->
      <div class="error-overlay" *ngIf="hasError" (click)="$event.stopPropagation(); $event.preventDefault()">
        <div class="error-glass-card" (click)="$event.stopPropagation(); $event.preventDefault()">
          <div class="error-header">
            <div class="error-icon-bg">
              <mat-icon>error_outline</mat-icon>
            </div>
            <div class="error-title">{{ 'VIEWER.LOAD_ERROR' | translate }}</div>
          </div>
          <div class="error-body">
            <ng-container *ngIf="isAiGeneration; else defaultError">
              {{ 'VIEWER.AI_GENERATION_PENDING' | translate }}
            </ng-container>
            <ng-template #defaultError>
              {{ 'VIEWER.ERROR_DESCRIPTION' | translate }}
            </ng-template>
          </div>
          <div class="error-hint" *ngIf="isAiGeneration">
             <mat-icon>hourglass_empty</mat-icon>
             <span class="hint-text">Model may still be processing on the AI server</span>
          </div>
          <div class="error-actions" style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <button type="button" class="retry-btn" (click)="checkAndLoad(); $event.stopPropagation(); $event.preventDefault()">
              <mat-icon>refresh</mat-icon>
              <span>Try Reloading</span>
            </button>
            <button type="button" class="logs-btn" (click)="toggleLogs(); $event.stopPropagation(); $event.preventDefault()">
              <mat-icon>{{ showLogs ? 'expand_less' : 'expand_more' }}</mat-icon>
              <span>{{ (showLogs ? 'VIEWER.HIDE_LOGS' : 'VIEWER.SHOW_LOGS') | translate }}</span>
            </button>
          </div>

          <div class="logs-container" *ngIf="showLogs" (click)="$event.stopPropagation()">
            <div class="logs-title">{{ 'VIEWER.LOGS_TITLE' | translate }}</div>
            <div class="log-item"><strong>URL:</strong> {{ failedUrl }}</div>
            <div class="log-item" *ngIf="getErrorString()"><strong>Error:</strong> {{ getErrorString() }}</div>
            <div class="log-suggestion" *ngIf="getAdvice()">
              <strong>Suggestion:</strong> {{ getAdvice() }}
            </div>
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
      <div class="controls-hint" *ngIf="!isLoading && !previewOnly && !hasError">
        <div class="hint-badge">{{ 'VIEWER.THREED_HINT' | translate }}</div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
    .viewer-host { 
      position: relative; width: 100%; height: 100%; overflow: hidden; 
      border-radius: inherit;
      background: transparent;
    }

    .three-canvas { width: 100%; height: 100%; opacity: 0; transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1); }
    .three-canvas.ready { opacity: 1; }

    /* Premium Loader */
    .loader-overlay {
      position: absolute; inset: 0; z-index: 20;
      display: flex; align-items: center; justify-content: center;
      background: rgba(10, 10, 12, 0.95);
      backdrop-filter: blur(15px);
    }
    .loader-content { display: flex; flex-direction: column; align-items: center; gap: 2rem; }
    
    .spinner-container {
      position: relative; width: 80px; height: 80px;
      display: flex; align-items: center; justify-content: center;
    }
    .glass-ring {
      position: absolute; width: 100%; height: 100%;
      border: 3px solid rgba(255, 255, 255, 0.05);
      border-radius: 50%;
    }
    .accent-ring {
      position: absolute; width: 100%; height: 100%;
      border: 3px solid transparent;
      border-top-color: #6366f1;
      border-right-color: #818cf8;
      border-radius: 50%;
      animation: spin 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    }
    .core-dot {
      width: 8px; height: 8px; background: #6366f1; border-radius: 50%;
      box-shadow: 0 0 15px #6366f1;
      animation: pulse 1.5s ease-in-out infinite;
    }

    .loader-info { width: 220px; text-align: center; }
    .loader-title { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.2em; color: #94a3b8; text-transform: uppercase; margin-bottom: 1rem; }
    .progress-container { width: 100%; height: 3px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; margin-bottom: 0.5rem; }
    .progress-bar { height: 100%; background: linear-gradient(90deg, #6366f1, #a78bfa); transition: width 0.4s ease; }
    .loader-percent { font-size: 0.9rem; font-weight: 600; color: #f8fafc; }

    /* Beautiful Error Card */
    .error-overlay {
      position: absolute; inset: 0; z-index: 20;
      display: flex; align-items: center; justify-content: center;
      background: rgba(10, 10, 12, 0.7); backdrop-filter: blur(8px);
      padding: 1.5rem;
    }
    .error-glass-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 1rem;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
      animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .error-header { display: flex; flex-direction: column; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
    .error-icon-bg {
      width: 56px; height: 56px; background: rgba(239, 68, 68, 0.1);
      border-radius: 16px; display: flex; align-items: center; justify-content: center;
      color: #ef4444;
    }
    .error-title { font-size: 1.25rem; font-weight: 700; color: #f8fafc; letter-spacing: -0.01em; margin-bottom: 0.5rem; }
    .error-body { 
      font-size: 0.9rem; line-height: 1.5; color: #94a3b8; 
      margin-bottom: 1rem; padding: 0 1rem;
    }
    .error-hint {
      display: flex; align-items: center; justify-content: center; gap: 10px;
      padding: 10px 14px; background: rgba(255, 255, 255, 0.03); 
      border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 0.8rem; color: #64748b; margin: 0 1rem;
      
      mat-icon { 
        font-size: 16px; width: 16px; height: 16px; 
        color: #4b5563; flex-shrink: 0;
      }
      .hint-text { line-height: 1.3; text-align: left; }
    }
    .error-actions {
      margin-top: 1rem; display: flex; justify-content: center;
    }
    .retry-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 20px; background: #6366f1; color: white;
      border: none; border-radius: 10px; font-weight: 600; font-size: 0.85rem;
      cursor: pointer; transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      mat-icon { font-size: 18px; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; }
    }
    .retry-btn:hover { transform: translateY(-2px); background: #4f46e5; box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4); }

    .logs-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 20px; background: rgba(255, 255, 255, 0.05); color: #94a3b8;
      border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; font-weight: 600; font-size: 0.85rem;
      cursor: pointer; transition: all 0.3s ease;
      mat-icon { font-size: 18px; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; }
    }
    .logs-btn:hover { background: rgba(255, 255, 255, 0.1); color: #f8fafc; border-color: rgba(255, 255, 255, 0.2); }

    .logs-container {
      margin-top: 1rem;
      padding: 12px;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 14px;
      text-align: left;
      font-size: 0.75rem;
      max-height: 150px;
      overflow-y: auto;
      scrollbar-width: thin;
    }
    .logs-title {
      font-weight: 700;
      color: #cbd5e1;
      margin-bottom: 6px;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .log-item {
      color: #94a3b8;
      word-break: break-all;
      margin-bottom: 6px;
      line-height: 1.4;
    }
    .log-item strong {
      color: #f1f5f9;
    }
    .log-suggestion {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      color: #fbbf24;
      line-height: 1.4;
    }

    /* HD Toggle */
    .hd-toggle-container { position: absolute; top: 1rem; right: 1rem; z-index: 25; }
    .hd-toggle-btn {
      display: flex; align-items: center; gap: 0.6rem;
      background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px;
      color: #94a3b8; font-size: 0.75rem; font-weight: 600;
      padding: 0.5rem 0.9rem; cursor: pointer; transition: all 0.3s ease;
    }
    .hd-toggle-btn:hover { background: rgba(15, 23, 42, 0.8); color: #f8fafc; border-color: rgba(255, 255, 255, 0.2); }
    .hd-toggle-btn.active { background: rgba(99, 102, 241, 0.2); border-color: rgba(99, 102, 241, 0.5); color: #818cf8; box-shadow: 0 0 20px rgba(99, 102, 241, 0.2); }

    .controls-hint { position: absolute; bottom: 4.5rem; left: 50%; transform: translateX(-50%); pointer-events: none; opacity: 0; animation: fadeIn 1s ease forwards 2s; }
    .hint-badge { background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; color: rgba(255,255,255,0.5); font-size: 0.7rem; padding: 0.4rem 1rem; }

    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes pulse { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    :host-context([data-theme="light"]), :host-context([data-theme="default"]) {
      .viewer-host { background: #f1f5f9; }
      .loader-overlay { background: rgba(255, 255, 255, 0.9); }
      .loader-percent { color: #1e293b; }
      .error-glass-card { background: white; border-color: rgba(0,0,0,0.05); }
      .error-title { color: #1e293b; }
      .error-body { color: #475569; }
      .logs-btn { background: rgba(0, 0, 0, 0.03); border-color: rgba(0, 0, 0, 0.08); color: #475569; }
      .logs-btn:hover { background: rgba(0, 0, 0, 0.06); color: #1e293b; }
      .logs-container { background: rgba(0, 0, 0, 0.02); border-color: rgba(0, 0, 0, 0.05); }
      .logs-title { color: #334155; }
      .log-item { color: #475569; }
      .log-item strong { color: #1e293b; }
      .log-suggestion { color: #d97706; border-top-color: rgba(0, 0, 0, 0.05); }
    }

    :host-context([data-theme="dark"]) {
      .viewer-host { background: #0a0a0c; }
    }

    :host-context([data-theme="glass"]) {
      .loader-overlay {
        background: rgba(15, 23, 42, 0.25);
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
      }
      .error-overlay {
        background: rgba(15, 23, 42, 0.15);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      .error-glass-card {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.15);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
      }
    }

    :host-context([data-theme="dark-glass"]) {
      .viewer-host { background: rgba(10, 10, 20, 0.6); }
      .loader-overlay {
        background: rgba(10, 10, 20, 0.5);
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
      }
      .error-overlay {
        background: rgba(10, 10, 20, 0.4);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }
      .error-glass-card {
        background: rgba(255, 255, 255, 0.06);
        border-color: rgba(255, 255, 255, 0.12);
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
  lastErrorDetails: any = null;
  failedUrl = '';
  showLogs = false;
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
      this.checkAndLoad();
      
      this.resizeObserver = new ResizeObserver(() => {
        this.onResize();
      });
      this.resizeObserver.observe(this.container.nativeElement);
    }
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

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
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
    this.controls.autoRotate = this.autoRotate;
    this.controls.autoRotateSpeed = 1.2;
    this.controls.enableZoom = false;

    this.controls.addEventListener('start', () => {
      this.controls.enableZoom = true;
    });

    if (this.isMobile) {
      this.controls.touches.ONE = null;
      this.controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
      this.setupThreeFingerRotation();
    }

    if (this.previewOnly) {
      this.controls.enableZoom = false;
      this.controls.enablePan = false;
      this.controls.enableRotate = false;
    }
  }

  private loadModel() {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    loader.setDRACOLoader(dracoLoader);
    
    const pathToLoad = this.isHdMode && this.hdModelPath ? this.hdModelPath : this.modelPath;
    
    this.isAiGeneration = !!pathToLoad && (
      pathToLoad.toLowerCase().includes('task_') || 
      pathToLoad.toLowerCase().includes('ai-gen') || 
      pathToLoad.toLowerCase().includes('product3d-ai')
    );
    
    // AI models consistently load upside down (usually need 180deg flip on X)
    this._upsideDown = this.isAiGeneration;

    if (this.currentLoadedPath === pathToLoad && this.model) return;
    
    let url = fixBackendUrl(pathToLoad);
    if (url && !url.startsWith('http')) {
      url = this.location.prepareExternalUrl(url);
    }
    
    this.isLoading = true;
    this.hasError = false;
    this.lastErrorDetails = null;
    this.failedUrl = pathToLoad || '';

    loader.load(
      url,
      (gltf) => this.onLoadSuccess(gltf, pathToLoad),
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
        
        if (this.isHdMode && this.hdModelPath && this.modelPath && this.hdModelPath !== this.modelPath) {
          this.isHdMode = false;
          this.loadModel();
          return;
        }

        const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        if (isLocalHost && url.includes('localhost:3002') && !this.isRetryingFallback) {
          const prodBase = 'https://angular-ecommerce-backend.onrender.com';
          const fallbackUrl = url.replace(/https?:\/\/localhost:3002/, prodBase);
          this.isRetryingFallback = true;
          this.isLoading = true;
          this.hasError = false;

          loader.load(
            fallbackUrl,
            (gltf) => this.onLoadSuccess(gltf, fallbackUrl),
            null,
            (fallbackErr) => {
              this.isRetryingFallback = false;
              this.isLoading = false;
              this.hasError = true;
              this.lastErrorDetails = fallbackErr;
              this.failedUrl = fallbackUrl;
              this.cdr.detectChanges();
            }
          );
          return;
        }

        this.isLoading = false;
        this.hasError = true;
        this.lastErrorDetails = err;
        this.failedUrl = url;
        this.cdr.detectChanges();
      }
    );
  }

  toggleLogs() {
    this.showLogs = !this.showLogs;
    this.cdr.detectChanges();
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
    if (url.includes('onrender.com') && url.includes('/uploads/')) {
      return 'This file was stored on Render\'s ephemeral disk. It has been deleted due to a server restart. The model needs to be re-uploaded to Cloudinary.';
    }
    if (url.includes('localhost:3002') || url.includes('127.0.0.1:3002')) {
      return 'The backend server appears to be running locally but isn\'t accessible. Ensure your local backend is running on port 3002.';
    }
    if (url.includes('res.cloudinary.com')) {
      return 'Cloudinary resource could not be loaded. Please verify the URL is correct and the file exists in your Cloudinary console.';
    }
    return '';
  }

  private onLoadSuccess(gltf: any, url: string) {
    if (this.isDestroyed || !this.scene) return;
    if (this.model) this.scene.remove(this.model);

    this.model = gltf.scene;
    this.model.scale.set(this.scale[0], this.scale[1], this.scale[2]);
    
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

    this.model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = !this.isMobile;
        mesh.receiveShadow = !this.isMobile;
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
      // Rotate 180 degrees around X axis to flip model vertically
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

  private setupThreeFingerRotation() {
    const el = this.renderer.domElement;
    let lastX = 0, lastY = 0;

    el.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches.length === 3) {
        lastX = e.touches[0].pageX;
        lastY = e.touches[0].pageY;
        e.preventDefault();
      }
    }, { passive: false });

    el.addEventListener('touchmove', (e: TouchEvent) => {
      if (e.touches.length === 3) {
        const deltaX = e.touches[0].pageX - lastX;
        const deltaY = e.touches[0].pageY - lastY;
        lastX = e.touches[0].pageX;
        lastY = e.touches[0].pageY;
        const rotateScale = 0.5;
        (this.controls as any).rotateLeft(2 * Math.PI * deltaX / el.clientWidth * rotateScale);
        (this.controls as any).rotateUp(2 * Math.PI * deltaY / el.clientHeight * rotateScale);
        this.controls.update();
        e.preventDefault();
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
  }
}
