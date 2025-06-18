// Importing required dependencies and interfaces
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1s', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('0.5s', style({ opacity: 0 })),
      ]),
    ]),
  ]
})
export class HomeComponent implements OnInit, AfterViewInit {
  bestSellers: Product[] = [];
  specialOffer: Product | undefined;
  currentSection: string = 'banner';
  @ViewChild('threeCanvas') private canvasRef!: ElementRef;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private model: THREE.Object3D | null = null; // Инициализация как null с проверкой

  constructor(private productService: ProductService) {}

  // Initializing data on component load
  ngOnInit() {
    this.bestSellers = this.productService.getBestSellers();
    this.specialOffer = this.productService.getSpecialOffers()[0];
  }

  ngAfterViewInit() {
    this.initThreeJs();
    this.animate();
  }

  changeSection(section: string) {
    this.currentSection = section;
  }
  
  private initThreeJs() {
    // Создание сцены
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvasRef.nativeElement, alpha: true });
    this.renderer.setClearColor(0x000000, 0); // Прозрачный фон
    this.renderer.setSize(window.innerWidth / 2, window.innerHeight / 2); // Половина экрана для баннера
    this.camera.position.z = 5;

    // Загрузка материалов (.mtl)
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath('assets/models/women_bag/'); // Указываем путь к папке модели
    mtlLoader.load('women_bag.mtl', (materials) => {
      materials.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath('assets/models/women_bag/'); // Указываем путь к папке модели
      objLoader.load('women_bag.obj', (object) => {
        this.model = object;
        this.model.scale.set(0.5, 0.5, 0.5); // Настройка масштаба
        this.model.position.set(0, -1, 0); // Позиция модели
        this.scene.add(this.model);
        console.log('Модель успешно загружена:', this.model);
      }, undefined, (error) => {
        console.error('Ошибка загрузки модели:', error);
      });
    }, undefined, (error) => {
      console.error('Ошибка загрузки материалов:', error);
    });

    // Добавление света
    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Увеличенная интенсивность
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Увеличенная интенсивность
    directionalLight.position.set(0, 1, 0);
    this.scene.add(directionalLight);
    const pointLight = new THREE.PointLight(0xffffff, 1, 100); // Дополнительный свет
    pointLight.position.set(5, 5, 5);
    this.scene.add(pointLight);
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    if (this.model) {
      this.model.rotation.y += 0.01; // Анимация только если модель загружена
    }
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
  }
}