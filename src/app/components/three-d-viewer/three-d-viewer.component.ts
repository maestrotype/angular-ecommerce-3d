import { Component, Input, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

@Component({
  selector: 'app-three-d-viewer',
  template: '<div #container style="width: 100%; height: 100%;"></div>',
  styleUrls: ['./three-d-viewer.component.scss']
})
export class ThreeDViewerComponent implements AfterViewInit {
  @ViewChild('container') container!: ElementRef;
  @Input() modelPath!: string; // Input for model file path
  @Input() scale: [number, number, number] = [1, 1, 1]; // Default scale, can be overridden
  @Input() position: [number, number, number] = [0, 0, 0]; // Default position, can be overridden

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private model!: THREE.Object3D;

  ngAfterViewInit() {
    this.initThree();
    this.loadModel();
    this.animate();
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
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Lighting setup for brighter scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    this.scene.add(directionalLight);
  }

  private loadModel() {
    const loader = new GLTFLoader();
    loader.load(this.modelPath, (gltf) => {
      this.model = gltf.scene;
      this.model.position.set(this.position[0], this.position[1], this.position[2]);
      this.model.scale.set(this.scale[0], this.scale[1], this.scale[2]);
      const box = new THREE.Box3().setFromObject(this.model);
      box.getCenter(this.model.position);
      this.model.position.multiplyScalar(-1);
      this.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.needsUpdate = true;
          }
        }
      });
      this.camera.lookAt(this.model.position);
      this.scene.add(this.model);
      console.log('Model loaded successfully:', this.model);
    }, undefined, (error) => {
      console.error('Error loading model:', error);
    });
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    if (this.model) {
      this.model.rotation.y += 0.01;
    }
    this.renderer.render(this.scene, this.camera);
  }
}