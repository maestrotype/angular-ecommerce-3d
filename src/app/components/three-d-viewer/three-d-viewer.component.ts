import { Component, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID, HostListener, OnDestroy } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { fixBackendUrl } from '../../core/utils/url-helper';

@Component({
  selector: 'app-three-d-viewer',
  template: '<div #container style="width: 100%; height: 100%;"></div>',
  styleUrls: ['./three-d-viewer.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ThreeDViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container') container!: ElementRef;
  @Input() modelPath!: string; // Input for model file path
  @Input() scale: [number, number, number] = [1, 1, 1]; // Default scale, can be overridden
  @Input() position: [number, number, number] = [0, 0, 0]; // Default position, can be overridden
  @Input() previewOnly = false; // Disable controls for previews
  @Output() modelLoaded = new EventEmitter<void>();

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private model!: THREE.Object3D;
  private lastFrameTime = 0;
  private isMobile = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = /Mobi|Android/i.test(navigator.userAgent);
    }
  }

  ngAfterViewInit() {
    // Only initialize Three.js in browser (not on server)
    if (isPlatformBrowser(this.platformId)) {
      this.initThree();
      this.loadModel();
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (!isPlatformBrowser(this.platformId) || !this.renderer) return;
    const container = this.container.nativeElement;
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }

  ngOnDestroy() {
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initThree() {
    const container = this.container.nativeElement;
    this.scene = new THREE.Scene(); // No background as requested

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 10);
    this.camera.lookAt(0, 0, 0);

    // Renderer with enhanced quality
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    const pixelRatio = isPlatformBrowser(this.platformId) ? Math.min(window.devicePixelRatio, 1.5) : 1;
    this.renderer.setPixelRatio(pixelRatio); // Limit pixel ratio for performance
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = !this.isMobile;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Lighting setup for brighter scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = !this.isMobile;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    this.scene.add(directionalLight);

    // OrbitControls for manual rotation and zooming
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 20;
    this.controls.maxPolarAngle = Math.PI / 1.5; // Limit vertical rotation
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 2.0;

    if (this.previewOnly) {
      this.controls.enableRotate = false;
      this.controls.enableZoom = false;
      this.controls.enablePan = false;
    }
  }

  private loadModel() {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    // Resolve relative path using base URI for production environments like GitHub Pages
    let finalPath = fixBackendUrl(this.modelPath);
    if (isPlatformBrowser(this.platformId) && !finalPath.startsWith('http') && !finalPath.startsWith('//')) {
      const base = document.baseURI;
      if (base) {
        // Ensure base ends with slash and finalPath doesn't start with slash for correct joining
        const baseUrl = base.endsWith('/') ? base : base + '/';
        const modelUrl = finalPath.startsWith('/') ? finalPath.substring(1) : finalPath;
        finalPath = baseUrl + modelUrl;
      }
    }

    loader.load(finalPath, (gltf) => {
      this.model = gltf.scene;
      this.model.position.set(this.position[0], this.position[1], this.position[2]);
      this.model.scale.set(this.scale[0], this.scale[1], this.scale[2]);
      const box = new THREE.Box3().setFromObject(this.model);
      box.getCenter(this.model.position);
      this.model.position.multiplyScalar(-1);
      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = !this.isMobile;
          child.receiveShadow = !this.isMobile;
          if (child.material) {
            child.material.needsUpdate = true;
          }
        }
      });
      this.camera.lookAt(this.model.position);
      this.scene.add(this.model);

      this.modelLoaded.emit();
      this.animate(); // Start animation only after model is loaded
    }, undefined, (error) => {

    });
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    const now = performance.now();
    const delta = now - this.lastFrameTime;

    if (delta > 33) { // ~30 FPS
      this.lastFrameTime = now;
      if (this.controls) {
        this.controls.update();
      }
      this.renderer.render(this.scene, this.camera);
    }
  };
}
