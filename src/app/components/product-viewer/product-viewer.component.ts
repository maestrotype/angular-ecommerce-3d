import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ThreeDViewerComponent } from '../three-d-viewer/three-d-viewer.component';

@Component({
  selector: 'app-product-viewer',
  standalone: true,
  imports: [CommonModule, TranslateModule, ThreeDViewerComponent],
  templateUrl: './product-viewer.component.html',
  styleUrls: ['./product-viewer.component.scss']
})
export class ProductViewerComponent implements OnInit, OnDestroy {
  images: string[] = [];
  currentIndex = 0;
  model3dUrl = '';
  productName = '';
  mode: 'image' | '3d' = 'image';

  scale = 1;
  translateX = 0;
  translateY = 0;
  isDragging = false;
  startX = 0;
  startY = 0;

  modelReady = false;
  showControls = true;
  private hideControlsTimer: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    const state = this.route.snapshot.queryParams;
    
    try {
      const imagesParam = state['images'];
      const indexParam = state['index'];
      const modelParam = state['model'];
      const nameParam = state['name'];
      const modeParam = state['mode'];

      if (imagesParam) {
        this.images = JSON.parse(decodeURIComponent(imagesParam));
      }
      if (indexParam !== undefined) {
        this.currentIndex = parseInt(indexParam, 10);
      }
      if (modelParam) {
        this.model3dUrl = decodeURIComponent(modelParam);
      }
      if (nameParam) {
        this.productName = decodeURIComponent(nameParam);
      }
      if (modeParam === '3d' && this.model3dUrl) {
        this.mode = '3d';
      }
    } catch (e) {
      console.error('Error parsing viewer params', e);
    }

    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
    clearTimeout(this.hideControlsTimer);
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft': this.prevImage(); break;
      case 'ArrowRight': this.nextImage(); break;
      case 'Escape': this.goBack(); break;
    }
  }

  goBack() {
    this.router.navigate(['/product', this.route.snapshot.queryParams['productId']]);
  }

  setMode(m: 'image' | '3d') {
    this.mode = m;
    this.resetZoom();
  }

  prevImage() {
    this.resetZoom();
    if (this.images.length > 1) {
      this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.images.length - 1;
    }
  }

  nextImage() {
    this.resetZoom();
    if (this.images.length > 1) {
      this.currentIndex = this.currentIndex < this.images.length - 1 ? this.currentIndex + 1 : 0;
    }
  }

  selectImage(i: number) {
    this.resetZoom();
    this.currentIndex = i;
    this.mode = 'image';
  }

  // Zoom & Pan
  onWheel(event: WheelEvent) {
    if (this.mode !== 'image') return;
    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.15 : -0.15;
    this.scale = Math.max(1, Math.min(5, this.scale + delta));
    if (this.scale === 1) this.resetZoom();
  }

  onMouseDown(event: MouseEvent) {
    if (this.mode !== 'image' || this.scale <= 1) return;
    this.isDragging = true;
    this.startX = event.clientX - this.translateX;
    this.startY = event.clientY - this.translateY;
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    this.translateX = event.clientX - this.startX;
    this.translateY = event.clientY - this.startY;
  }

  onMouseUp() { this.isDragging = false; }

  toggleZoom() {
    if (this.mode !== 'image') return;
    if (this.scale > 1) { this.resetZoom(); } else { this.scale = 2.5; }
  }

  resetZoom() {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.isDragging = false;
  }

  get imageTransform(): string {
    return `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
  }

  get imageStyle() {
    return { transform: this.imageTransform, cursor: this.scale > 1 ? 'grab' : 'zoom-in' };
  }
}
