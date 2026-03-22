import { Component, AfterViewInit, ViewChild, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { fixBackendUrl } from '../../../core/utils/url-helper';

@Component({
  selector: 'app-bag3dFirst',
  templateUrl: './bag3dFirst.component.html',
  styleUrls: ['./bag3dFirst.component.scss']
})
export class Bag3dFirstComponent implements AfterViewInit {
  @ViewChild('container') container!: ElementRef;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private model!: THREE.Object3D;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  ngAfterViewInit() {
    // Only initialize Three.js in browser (not on server)
    if (isPlatformBrowser(this.platformId)) {
      this.initThree();
      this.loadModel();
      this.animate();
    }
  }

  private initThree() {
    const container = this.container.nativeElement;
    this.scene = new THREE.Scene(); // No background set as per request

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 10);
    this.camera.lookAt(0, 0, 0);

    // Renderer with enhanced quality
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = false;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows for better quality
    container.appendChild(this.renderer.domElement);

    // Lighting setup for brighter scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 3); // Increased ambient light intensity
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // Increased directional light intensity
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096; // Higher shadow resolution
    directionalLight.shadow.mapSize.height = 4096;
    this.scene.add(directionalLight);
  }

  private loadModel() {
    const loader = new GLTFLoader();
    
    // Resolve relative path using base URI for production environments
    let modelPath = fixBackendUrl('assets/models/bag/bag1.glb'); // Corrected path to include bag folder
    if (isPlatformBrowser(this.platformId)) {
      const base = document.baseURI;
      if (base) {
        const baseUrl = base.endsWith('/') ? base : base + '/';
        modelPath = baseUrl + modelPath;
      }
    }
    
    loader.load(modelPath, (gltf) => {
      this.model = gltf.scene;
      this.model.position.set(0, 0, 0);
      this.model.scale.set(9, 9, 9); // Scale as set by you

      const box = new THREE.Box3().setFromObject(this.model);
      box.getCenter(this.model.position);
      this.model.position.multiplyScalar(-1);
      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true; // Enable shadows for the model
          child.receiveShadow = true; // Enable receiving shadows
          if (child.material) {
            child.material.needsUpdate = true; // Ensure material updates
          }
        }
      });
      this.camera.lookAt(this.model.position);
      this.scene.add(this.model);

    }, undefined, (error) => {

    });
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    if (this.model) {
      this.model.rotation.y += 0.005; // Rotate model
    }
    this.renderer.render(this.scene, this.camera);
  }
}