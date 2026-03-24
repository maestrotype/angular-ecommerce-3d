import { Component, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID, HostListener, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser, CommonModule, Location } from '@angular/common';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TranslateModule } from '@ngx-translate/core';
import { fixBackendUrl } from '../../core/utils/url-helper';

@Component({
  selector: 'app-three-d-viewer',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="viewer-host">
      <!-- Luxury 3D Loader -->
      <div class="loader-overlay" *ngIf="isLoading">
        <div class="loader-scene">
          <!-- Orbital rings -->
          <div class="orbit-ring orbit-1"></div>
          <div class="orbit-ring orbit-2"></div>
          <div class="orbit-ring orbit-3"></div>
          <!-- Center core -->
          <div class="loader-core">
            <div class="core-inner"></div>
          </div>
          <!-- Floating particles -->
          <div class="particle p1"></div>
          <div class="particle p2"></div>
          <div class="particle p3"></div>
          <div class="particle p4"></div>
          <div class="particle p5"></div>
          <div class="particle p6"></div>
        </div>
        <div class="loader-info">
          <div class="loader-title">{{ 'VIEWER.LOADING' | translate }}</div>
          <div class="progress-track">
            <div class="progress-fill" [style.width.%]="loadingProgress"></div>
            <div class="progress-glow" [style.left.%]="loadingProgress"></div>
          </div>
          <div class="loader-percent">{{ loadingProgress }}%</div>
        </div>
      </div>

      <!-- Canvas -->
      <div #container class="three-canvas" [class.ready]="!isLoading"></div>

      <!-- Controls hint -->
      <div class="controls-hint" *ngIf="!isLoading && !previewOnly">
        <div class="hint-badge">{{ 'VIEWER.THREED_HINT' | translate }}</div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
    .viewer-host { position: relative; width: 100%; height: 100%; overflow: hidden; }

    /* Canvas */
    .three-canvas { width: 100%; height: 100%; opacity: 0; transition: opacity 0.8s ease; }
    .three-canvas.ready { opacity: 1; }

    /* ── LOADER ─────────────────────────────────────── */
    .loader-overlay {
      position: absolute; inset: 0; z-index: 10;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 2.5rem;
      background: radial-gradient(ellipse at center, rgba(15,10,30,0.97) 0%, rgba(5,5,10,0.99) 100%);
    }

    .loader-scene {
      position: relative; width: 160px; height: 160px;
      display: flex; align-items: center; justify-content: center;
    }

    /* Orbit rings */
    .orbit-ring {
      position: absolute; border-radius: 50%;
      border: 2px solid transparent; animation: spin linear infinite;
    }
    .orbit-1 {
      width: 160px; height: 160px;
      border-top-color: rgba(99,102,241,0.9);
      border-right-color: rgba(99,102,241,0.3);
      animation-duration: 2s;
    }
    .orbit-2 {
      width: 120px; height: 120px;
      border-top-color: rgba(139,92,246,0.8);
      border-left-color: rgba(139,92,246,0.2);
      animation-duration: 1.5s; animation-direction: reverse;
    }
    .orbit-3 {
      width: 80px; height: 80px;
      border-top-color: rgba(236,72,153,0.7);
      border-right-color: rgba(236,72,153,0.15);
      animation-duration: 1s;
    }

    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    /* Core */
    .loader-core {
      width: 40px; height: 40px; border-radius: 50%;
      background: radial-gradient(circle, rgba(139,92,246,1) 0%, rgba(99,102,241,0.6) 60%, transparent 100%);
      box-shadow: 0 0 30px rgba(139,92,246,0.8), 0 0 60px rgba(99,102,241,0.4), inset 0 0 20px rgba(255,255,255,0.2);
      animation: pulse 1.5s ease-in-out infinite;
      display: flex; align-items: center; justify-content: center;
    }
    .core-inner {
      width: 16px; height: 16px; border-radius: 50%;
      background: radial-gradient(circle, #fff 0%, rgba(196,181,253,0.8) 100%);
      animation: pulse 1s ease-in-out infinite reverse;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.15); opacity: 0.85; }
    }

    /* Particles */
    .particle {
      position: absolute; width: 6px; height: 6px; border-radius: 50%;
      background: rgba(196,181,253,0.9);
      box-shadow: 0 0 8px rgba(196,181,253,0.8);
      animation: orbit-particle linear infinite;
    }
    .p1 { animation-duration: 2s; animation-delay: 0s;    --r: 78px; width: 8px; height: 8px; background: rgba(99,102,241,1); }
    .p2 { animation-duration: 2s; animation-delay: -0.33s; --r: 78px; }
    .p3 { animation-duration: 2s; animation-delay: -0.66s; --r: 78px; }
    .p4 { animation-duration: 1.5s; animation-delay: -0.25s; --r: 58px; width: 5px; height: 5px; background: rgba(139,92,246,1); }
    .p5 { animation-duration: 1.5s; animation-delay: -0.75s; --r: 58px; width: 4px; height: 4px; }
    .p6 { animation-duration: 1s;   animation-delay: -0.5s;  --r: 38px; width: 4px; height: 4px; background: rgba(236,72,153,1); }

    @keyframes orbit-particle {
      0%   { transform: rotate(0deg)   translateX(var(--r)) rotate(0deg); opacity: 1; }
      50%  { opacity: 0.4; }
      100% { transform: rotate(360deg) translateX(var(--r)) rotate(-360deg); opacity: 1; }
    }

    /* Loader info */
    .loader-info { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; width: 240px; }
    .loader-title {
      font-size: 0.9rem; font-weight: 600; letter-spacing: 0.05em;
      color: rgba(196,181,253,0.9);
      text-transform: uppercase;
    }
    .progress-track {
      width: 100%; height: 4px; background: rgba(255,255,255,0.08);
      border-radius: 4px; position: relative; overflow: visible;
    }
    .progress-fill {
      height: 100%; border-radius: 4px;
      background: linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899);
      transition: width 0.3s ease;
    }
    .progress-glow {
      position: absolute; top: -5px;
      width: 12px; height: 12px; border-radius: 50%;
      background: #c4b5fd;
      box-shadow: 0 0 12px 4px rgba(196,181,253,0.8);
      transform: translateX(-50%);
      transition: left 0.3s ease;
      margin-left: -6px;
    }
    .loader-percent {
      font-size: 2rem; font-weight: 800;
      background: linear-gradient(135deg, #6366f1, #c4b5fd);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }

    /* Controls hint */
    .controls-hint {
      position: absolute; bottom: 1.25rem; left: 50%; transform: translateX(-50%);
      pointer-events: none;
    }
    .hint-badge {
      background: rgba(0,0,0,0.6); backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 20px;
      color: rgba(255,255,255,0.5); font-size: 0.75rem;
      padding: 0.4rem 1rem; white-space: nowrap;
    }
  `]
})
export class ThreeDViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container') container!: ElementRef;
  @Input() modelPath!: string;
  @Input() scale: [number, number, number] = [1, 1, 1];
  @Input() position: [number, number, number] = [0, 0, 0];
  @Input() previewOnly = false;
  @Input() autoRotate = true;
  @Output() modelLoaded = new EventEmitter<void>();

  isLoading = true;
  loadingProgress = 0;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private model!: THREE.Object3D;
  private animId!: number;
  private isMobile = false;
  private isDestroyed = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private location: Location
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = /Mobi|Android/i.test(navigator.userAgent);
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initThree();
      if (this.modelPath) this.loadModel();
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (!isPlatformBrowser(this.platformId) || !this.renderer || !this.container) return;
    const el = this.container.nativeElement;
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
    this.controls.autoRotate = this.autoRotate && !this.previewOnly;
    this.controls.autoRotateSpeed = 1.5;
    if (this.previewOnly) {
      this.controls.enableZoom = false;
      this.controls.enablePan = false;
      this.controls.enableRotate = false;
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
    
    let url = fixBackendUrl(this.modelPath);
    if (url && !url.startsWith('http')) {
      url = this.location.prepareExternalUrl(url);
    }

    loader.load(
      url,
      (gltf) => {
        if (this.isDestroyed || !this.scene) return;
        if (this.model) this.scene.remove(this.model);

        this.model = gltf.scene;
        const box = new THREE.Box3().setFromObject(this.model);
        const center = box.getCenter(new THREE.Vector3());
        this.model.position.sub(center);
        this.model.scale.set(this.scale[0], this.scale[1], this.scale[2]);
        this.model.position.add(new THREE.Vector3(...this.position));

        // Automatic camera distance based on model size to prevent clipping
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x * this.scale[0], size.y * this.scale[1], size.z * this.scale[2]);
        const fov = this.camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        
        cameraZ *= 1.4; // Comfort margin
        this.camera.position.z = cameraZ;
        
        if (this.controls) {
          this.controls.minDistance = cameraZ * 0.2;
          this.controls.maxDistance = cameraZ * 5;
          this.controls.update();
        }

        this.model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = !this.isMobile;
            mesh.receiveShadow = !this.isMobile;

            // Fix for Three.js uniform/shader errors where name is null
            if (!mesh.name) mesh.name = 'mesh_' + Math.random().toString(36).substr(2, 9);
            
            if (mesh.material) {
              const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              materials.forEach(mat => {
                if (mat && !mat.name) {
                  mat.name = 'mat_' + Math.random().toString(36).substr(2, 9);
                }
              });
            }
          }
        });

        this.scene.add(this.model);
        this.isLoading = false;
        this.cdr.detectChanges();
        this.modelLoaded.emit();
        this.animate();
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
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    );
  }

  private animate = () => {
    if (this.isDestroyed) return;
    this.animId = requestAnimationFrame(this.animate);
    if (this.controls) this.controls.update();
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  };

  ngOnDestroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animId);
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
