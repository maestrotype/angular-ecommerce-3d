import { Component, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslateModule } from '@ngx-translate/core';
import { UavMappingService } from '../../services/uav-mapping.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { interval, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';

export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface LandmarkSummary {
  railways: number;
  rivers: number;
  settlements: number;
  buildings: number;
  roads: number;
  forests: number;
  waterBodies: number;
}

@Component({
  selector: 'app-uav-mapping',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatIconModule,
    MatButtonModule, MatSlideToggleModule, MatProgressBarModule, TranslateModule
  ],
  templateUrl: './uav-mapping.component.html',
  styleUrl: './uav-mapping.component.scss'
})
export class UavMappingComponent implements AfterViewInit, OnDestroy {
  videoFile: File | null = null;
  referenceImageFile: File | null = null;
  referenceImageFiles: File[] = [];
  multiGeoFrames: any[] = [];
  routeConfidence: number = 0;
  isMultiImageMode: boolean = false;
  activeFrameIndex: number = 0;
  cropVideo: boolean = true;
  taskPrompt: string = '';

  // ── Separate processing flags per mode ──────────────
  isVideoProcessing: boolean = false;
  isGeoProcessing: boolean = false;
  isDraggingFile: boolean = false;

  // Video progress
  videoLoadingProgress: number = 0;
  currentVideoAction: string = '';

  // Geo progress
  geoLoadingProgress: number = 0;
  currentGeoAction: string = '';

  // Backward-compat getter used in templates and guards
  get isProcessing(): boolean {
    return this.isVideoProcessing || this.isGeoProcessing;
  }

  taskId: string | null = null;
  private pollSub: Subscription | null = null;

  showResults: boolean = false;
  selectedBounds: GeoBounds | null = null;
  trajectoryStats: { points: number, distanceKm: number } | null = null;
  landmarks: LandmarkSummary | null = null;
  landmarksLoading: boolean = false;
  textAnalysis: string | null = null;
  confidence: number = 0;

  // Area selection map
  isDrawing: boolean = false;
  private selectionMap: L.Map | null = null;
  private selectionRect: L.Rectangle | null = null;
  private drawStartLatLng: L.LatLng | null = null;
  private settlementMarkers: L.Marker[] = [];
  private mapResizeObserver: ResizeObserver | null = null;

  @HostListener('window:paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    const items = event.clipboardData?.items;
    if (!items) return;
    
    const filesToUpload: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          filesToUpload.push(file);
        }
      }
    }

    if (filesToUpload.length > 0) {
      this.addScreenshots(filesToUpload);
      this.snackBar.open(
        filesToUpload.length === 1 ? 'Изображение вставлено из буфера обмена!' : `Вставлено ${filesToUpload.length} изображений из буфера обмена!`, 
        'OK', 
        { duration: 2000 }
      );
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingFile = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingFile = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingFile = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const files: File[] = [];
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        const file = event.dataTransfer.files[i];
        if (file.type.startsWith('image/')) {
          files.push(file);
        }
      }
      if (files.length > 0) {
        this.addScreenshots(files);
      }
    }
  }

  // Results map
  private resultsMap: L.Map | null = null;
  private animatedPolyline: L.Polyline | null = null;
  private animationInterval: any = null;

  constructor(
    private uavService: UavMappingService,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {}

  ngAfterViewInit() {
    setTimeout(() => this.initSelectionMap(), 100);
  }

  // ─── Selection Map ───────────────────────────────────────────────────────────

  private initSelectionMap() {
    if (this.selectionMap) {
      this.selectionMap.remove();
    }

    this.selectionMap = L.map('selectionMap', {
      center: [48.5, 35.0],  // Default: Ukraine
      zoom: 10
    });

    // ESRI World Imagery — free satellite tiles, no API key needed
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP',
      maxZoom: 19
    }).addTo(this.selectionMap);
    
    // ESRI Label overlay (so city & road names are still visible on satellite)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      attribution: '',
      maxZoom: 19,
      opacity: 0.8
    }).addTo(this.selectionMap);

    // FIX: Leaflet often fails to render all tiles when initialized inside flexbox containers
    // or when the window size changes. We add a ResizeObserver to automatically invalidate the size.
    const mapContainer = document.getElementById('selectionMap');
    if (mapContainer) {
      this.mapResizeObserver = new ResizeObserver(() => {
        if (this.selectionMap) {
          this.selectionMap.invalidateSize();
        }
      });
      this.mapResizeObserver.observe(mapContainer);
    }
    
    // Fallback explicit invalidation after layout settles
    setTimeout(() => {
      if (this.selectionMap) this.selectionMap.invalidateSize();
    }, 250);

    // Click handler for drawing
    this.selectionMap.on('click', (e: L.LeafletMouseEvent) => {
      if (!this.isDrawing) {
        // First click: start rectangle
        this.isDrawing = true;
        this.drawStartLatLng = e.latlng;

        if (this.selectionRect) {
          this.selectionMap!.removeLayer(this.selectionRect);
          this.selectionRect = null;
        }

        this.selectionRect = L.rectangle(
          L.latLngBounds(e.latlng, e.latlng),
          { color: '#6366f1', weight: 2, dashArray: '6 4', fillOpacity: 0.15, fillColor: '#6366f1' }
        ).addTo(this.selectionMap!);

      } else {
        // Second click: finalize
        if (this.selectionRect && this.drawStartLatLng) {
          const bounds = this.selectionRect.getBounds();

          // Рассчитываем площадь в км²
          const latSpan = bounds.getNorth() - bounds.getSouth();
          const lngSpan = bounds.getEast() - bounds.getWest();
          const centerLat = (bounds.getNorth() + bounds.getSouth()) / 2;
          const latKm = latSpan * 111.32;
          const lngKm = lngSpan * 111.32 * Math.cos(centerLat * Math.PI / 180);
          const areaKm2 = latKm * lngKm;

          // Предупреждение если < 10 км²
          if (areaKm2 < 10) {
            this.snackBar.open(
              `⚠️ Выбранная зона слишком мала (${areaKm2.toFixed(1)} км²). ` +
              `Рекомендуется минимум 10 км², идеально 20+ км² для надежного поиска. ` +
              `Пожалуйста, выберите большую область.`,
              'OK', { duration: 6000 }
            );
            // Сбрасываем и даем перерисовать
            this.isDrawing = false;
            this.drawStartLatLng = null;
            if (this.selectionRect) {
              this.selectionMap!.removeLayer(this.selectionRect);
              this.selectionRect = null;
            }
            return;
          }

          this.selectedBounds = {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
          };
          this.isDrawing = false;
          this.drawStartLatLng = null;
          if (areaKm2 > 200) {
            this.snackBar.open(
              `⚠️ Большая зона: ${areaKm2.toFixed(0)} км². Рекомендуется до 150 км² для надёжной геолокации скриншотов.`,
              'OK', { duration: 6000 }
            );
          } else {
            this.snackBar.open(
              `✅ Зона ${areaKm2.toFixed(1)} км² выбрана! Загрузите скриншот и нажмите "Геолоцировать".`,
              'OK', { duration: 3000 }
            );
          }
          // Query Overpass API for landmarks in the selected area
          this.queryLandmarks(this.selectedBounds!);
        }
      }
    });

    // Mousemove: update rectangle while drawing
    this.selectionMap.on('mousemove', (e: L.LeafletMouseEvent) => {
      if (this.isDrawing && this.selectionRect && this.drawStartLatLng) {
        this.selectionRect.setBounds(L.latLngBounds(this.drawStartLatLng, e.latlng));
      }
    });
  }

  clearSelection() {
    this.selectedBounds = null;
    this.landmarks = null;
    this.isDrawing = false;
    this.drawStartLatLng = null;
    if (this.selectionRect && this.selectionMap) {
      this.selectionMap.removeLayer(this.selectionRect);
      this.selectionRect = null;
    }
    this.settlementMarkers.forEach(m => this.selectionMap?.removeLayer(m));
    this.settlementMarkers = [];
  }

  getAreaKm2(): number {
    if (!this.selectedBounds) return 0;
    const latSpan = this.selectedBounds.north - this.selectedBounds.south;
    const lngSpan = this.selectedBounds.east - this.selectedBounds.west;
    const centerLat = (this.selectedBounds.north + this.selectedBounds.south) / 2;
    return latSpan * 111.32 * lngSpan * 111.32 * Math.cos(centerLat * Math.PI / 180);
  }

  resetAll() {
    this.videoFile = null;
    this.referenceImageFile = null;
    this.referenceImageFiles = [];
    this.isMultiImageMode = false;
    this.multiGeoFrames = [];
    this.routeConfidence = 0;
    this.selectedBounds = null;
    this.landmarks = null;
    this.taskId = null;
    this.isVideoProcessing = false;
    this.isGeoProcessing = false;
    this.videoLoadingProgress = 0;
    this.geoLoadingProgress = 0;
    this.currentVideoAction = '';
    this.currentGeoAction = '';
    this.showResults = false;
    this.taskPrompt = '';
    this.textAnalysis = null;
    this.confidence = 0;
    this.trajectoryStats = null;
    this.previewUrlsMap.clear();
    
    this.clearSelection();
    if (this.pollSub) this.pollSub.unsubscribe();
    this.snackBar.open('Все данные сброшены.', 'OK', { duration: 2000 });
  }

  // ─── Video handling ──────────────────────────────────────────────────────────

  onVideoSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.videoFile = file;
  }

  removeVideo(event: Event) {
    event.stopPropagation();
    this.videoFile = null;
  }
  
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.referenceImageFile = file;
  }
  
  removeImage(event: Event) {
    event.stopPropagation();
    this.referenceImageFile = null;
  }

  removeSingleImage() {
    this.referenceImageFile = null;
    this.isMultiImageMode = false;
    this.previewUrlsMap.clear();
  }

  getGeoButtonLabel(): string {
    if (this.isGeoProcessing) return 'Обработка...';
    if (this.isMultiImageMode && this.referenceImageFiles.length > 1) {
      return `Построить маршрут (${this.referenceImageFiles.length} фото)`;
    }
    return 'Найти скриншот на карте';
  }

  onMultiImageFilesSelected(event: any) {
    if (!event.target.files) return;
    const files = Array.from(event.target.files) as File[];
    if (files.length === 0) return;

    this.addScreenshots(files);
    event.target.value = ''; // Reset input to allow selecting same file
  }

  addScreenshots(files: File[]) {
    let currentFiles: File[] = [];
    if (this.isMultiImageMode) {
      currentFiles = [...this.referenceImageFiles];
    } else if (this.referenceImageFile) {
      currentFiles = [this.referenceImageFile];
    }

    const newFiles = [...currentFiles, ...files];
    if (newFiles.length > 20) {
      this.snackBar.open('Максимум 20 изображений разрешено', 'Закрыть', { duration: 3000 });
      return;
    }

    if (newFiles.length === 1) {
      this.referenceImageFile = newFiles[0];
      this.referenceImageFiles = [];
      this.isMultiImageMode = false;
    } else {
      this.referenceImageFiles = newFiles;
      this.referenceImageFile = null;
      this.isMultiImageMode = true;
    }
  }

  replaceSingleScreenshot(input: HTMLInputElement) {
    this.removeSingleImage();
    setTimeout(() => input.click(), 50);
  }

  removeImageAtIndex(index: number) {
    this.referenceImageFiles = this.referenceImageFiles.filter((_, i) => i !== index);
    if (this.referenceImageFiles.length === 1) {
      this.referenceImageFile = this.referenceImageFiles[0];
      this.referenceImageFiles = [];
      this.isMultiImageMode = false;
    } else if (this.referenceImageFiles.length === 0) {
      this.isMultiImageMode = false;
    }
  }

  private previewUrlsMap = new Map<File, string>();
  getFilePreviewUrl(file: File): string {
    if (!this.previewUrlsMap.has(file)) {
      this.previewUrlsMap.set(file, URL.createObjectURL(file));
    }
    return this.previewUrlsMap.get(file)!;
  }

  getFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  // ─── Processing ──────────────────────────────────────────────────────────────

  geolocateCurrentScreenshot() {
    if (!this.selectedBounds || this.isProcessing) return;

    if (this.isMultiImageMode && this.referenceImageFiles.length > 1) {
      this.geolocateMultiImages();
      return;
    }

    if (!this.referenceImageFile) return;

    this.isGeoProcessing = true;
    this.geoLoadingProgress = 10;
    this.currentGeoAction = 'Поиск на спутниковой карте...';

    this.uavService.geolocateImage(this.referenceImageFile, this.selectedBounds).subscribe({
      next: (res) => {
        this.isGeoProcessing = false;
        if (res.status === 'success') {
          this.snackBar.open('Скриншот найден! Область отображена на карте.', 'Закрыть', { duration: 5000 });
          this.showResults = true;
          // confidence stored as 0-100 for display
          this.confidence = res.confidence * 100;
          const confPct = this.confidence.toFixed(1);
          this.textAnalysis = `Скриншот геолоцирован с уверенностью ${confPct}% — координаты: ${res.lat.toFixed(6)}, ${res.lng.toFixed(6)}.`;

          setTimeout(() => this.initResultsMap(
            [[res.lat, res.lng]],
            true,
            res.footprint_corners || [],
            res.zoom || 17
          ), 150);
        } else {
          this.snackBar.open('Геолокация не удалась: ' + res.error, 'Закрыть', { duration: 7000 });
        }
      },
      error: (err) => {
        this.isGeoProcessing = false;
        this.snackBar.open('Ошибка API: ' + err.message, 'Закрыть', { duration: 5000 });
      }
    });
  }

  geolocateMultiImages() {
    if (!this.selectedBounds || this.isProcessing) return;

    this.isGeoProcessing = true;
    this.geoLoadingProgress = 5;
    this.currentGeoAction = `Отправка ${this.referenceImageFiles.length} снимков на обработку...`;
    this.textAnalysis = null;
    this.multiGeoFrames = [];

    this.uavService.geolocateMultiImages(this.referenceImageFiles, this.selectedBounds).subscribe({
      next: (initRes) => {
        const taskId = initRes.task_id;
        this.currentGeoAction = 'Ожидание в очереди...';
        this.geoLoadingProgress = 10;
        
        const pollInterval = setInterval(() => {
          this.uavService.getTaskStatus(taskId).subscribe({
            next: (status) => {
              if (status.status === 'processing' || status.status === 'pending') {
                this.geoLoadingProgress = status.progress || 10;
                this.currentGeoAction = status.current_action || 'Обработка изображений...';
              } else if (status.status === 'success') {
                clearInterval(pollInterval);
                this.currentGeoAction = 'Получение результатов...';
                this.geoLoadingProgress = 95;
                
                this.uavService.getTaskResult(taskId).subscribe({
                  next: (result) => {
                    this.isGeoProcessing = false;
                    this.showResults = true;
                    this.multiGeoFrames = result.frames || [];
                    this.routeConfidence = result.route_confidence || 0;
                    // store as 0-100 for display
                    this.confidence = (result.route_confidence || 0) * 100;
                    
                    const successCount = result.successful_frames || 0;
                    const totalCount = result.total_frames || 0;
                    const confPct = this.confidence.toFixed(1);
                    
                    this.textAnalysis = `Построен вероятностный маршрут по ${successCount} из ${totalCount} кадров. Общая уверенность маршрута: ${confPct}%.`;
                    
                    // Проверяем, все ли кадры упали из-за "Area too large"
                    const allFailedWithAreaError = (result.frames || []).every(
                      (f: any) => f.status === 'failed' && f.error?.includes('Area too large')
                    );

                    if (allFailedWithAreaError && (result.frames || []).length > 0) {
                      this.snackBar.open(
                        '⚠️ Зона поиска слишком большая для данного алгоритма. Уменьшите прямоугольник на карте (~50-70 км²) и попробуйте снова.',
                        'Закрыть',
                        { duration: 10000 }
                      );
                      return;
                    }

                    const trajectory: [number, number][] = (result.frames || [])
                      .filter((f: any) => f.status === 'success')
                      .map((f: any) => [f.lat, f.lng] as [number, number]);
                      
                    if (trajectory.length === 0) {
                      this.snackBar.open('Ни один из кадров не был геолоцирован.', 'Закрыть', { duration: 7000 });
                      return;
                    }
                    
                    setTimeout(() => {
                      this.initResultsMap(trajectory, true, [], 17, result.frames || []);
                    }, 150);
                  },
                  error: (err) => {
                    this.isGeoProcessing = false;
                    this.snackBar.open('Ошибка загрузки результатов: ' + err.message, 'Закрыть', { duration: 5000 });
                  }
                });
              } else if (status.status === 'failed') {
                clearInterval(pollInterval);
                this.isGeoProcessing = false;
                const errText = status.error || '';
                if (errText.includes('Area too large')) {
                  this.snackBar.open(
                    '⚠️ Зона поиска слишком большая для данного алгоритма. Уменьшите прямоугольник на карте (~50-70 км²) и попробуйте снова.',
                    'Закрыть',
                    { duration: 10000 }
                  );
                } else {
                  this.snackBar.open('Обработка завершилась ошибкой: ' + (status.error || 'Неизвестная ошибка'), 'Закрыть', { duration: 7000 });
                }
              }
            },
            error: (err) => {
              clearInterval(pollInterval);
              this.isGeoProcessing = false;
              this.snackBar.open('Ошибка получения статуса: ' + err.message, 'Закрыть', { duration: 5000 });
            }
          });
        }, 3000);
      },
      error: (err) => {
        this.isGeoProcessing = false;
        this.snackBar.open('Не удалось начать обработку: ' + err.message, 'Закрыть', { duration: 5000 });
      }
    });
  }

  startProcessing() {
    if (!this.videoFile || !this.selectedBounds || this.isProcessing) return;

    this.isVideoProcessing = true;
    this.videoLoadingProgress = 0;
    this.textAnalysis = null;

    this.uavService.processVideo(this.videoFile, this.cropVideo, this.selectedBounds, this.referenceImageFile, this.taskPrompt).subscribe({
      next: (res) => {
        this.taskId = res.task_id;
        this.pollStatus();
      },
      error: (err) => {
        this.isVideoProcessing = false;
        this.snackBar.open('Не удалось запустить обработку: ' + err.message, 'Закрыть', { duration: 5000 });
      }
    });
  }

  stopProcessing() {
    if (!this.taskId) return;
    
    this.uavService.stopTask(this.taskId).subscribe({
      next: () => {
        this.isVideoProcessing = false;
        this.isGeoProcessing = false;
        if (this.pollSub) this.pollSub.unsubscribe();
        this.snackBar.open('Процесс остановлен.', 'OK', { duration: 3000 });
        this.currentVideoAction = '🛑 Остановлено';
      },
      error: (err) => {
        this.snackBar.open('Ошибка остановки: ' + (err.message || 'Неизвестная ошибка'), 'Закрыть', { duration: 5000 });
      }
    });
  }

  private pollStatus() {
    this.pollSub = interval(2000).subscribe(() => {
      if (!this.taskId) return;

      this.uavService.getTaskStatus(this.taskId).subscribe({
        next: (status) => {
          this.videoLoadingProgress = status.progress || 0;
          this.currentVideoAction = status.current_action || 'Обработка видео...';

          if (status.status === 'success') {
            this.isVideoProcessing = false;
            if (this.pollSub) this.pollSub.unsubscribe();
            this.snackBar.open('Маршрут построен! GPS-траектория готова.', 'Закрыть', { duration: 5000 });
            this.showResults = true;
            if (status.text_analysis) {
              this.textAnalysis = status.text_analysis;
            }
            setTimeout(() => this.loadTrajectoryAndRender(status.model_url!), 150);

          } else if (status.status === 'failed') {
            this.isVideoProcessing = false;
            if (this.pollSub) this.pollSub.unsubscribe();
            const msg = status.error || 'Неизвестная ошибка';
            this.snackBar.open('Построение маршрута не удалось: ' + msg, 'Закрыть', { duration: 10000 });
          }
        },
        error: (err) => console.error('Poll error', err)
      });
    });
  }

  // ─── Results Map (GPS trajectory on OSM) ─────────────────────────────────────

  private loadTrajectoryAndRender(trajectoryUrl: string) {
    this.http.get<{ trajectory: [number, number][], geo_calibrated: boolean, text_analysis?: string, confidence?: number }>(trajectoryUrl).subscribe({
      next: (res) => {
        if (res.text_analysis) this.textAnalysis = res.text_analysis;
        if (res.confidence) this.confidence = res.confidence;
        this.initResultsMap(res.trajectory, res.geo_calibrated);
      },
      error: () => this.snackBar.open('Failed to load trajectory data', 'Close', { duration: 5000 })
    });
  }

  private calculateDistance(path: [number, number][]): number {
    let dist = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const p1 = path[i];
      const p2 = path[i+1];
      const R = 6371; // Earth radius in km
      const dLat = (p2[0] - p1[0]) * Math.PI / 180;
      const dLon = (p2[1] - p1[1]) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(p1[0] * Math.PI / 180) * Math.cos(p2[0] * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      dist += R * c;
    }
    return Math.round(dist * 100) / 100;
  }

  private initResultsMap(
    trajectory: [number, number][],
    geoCalibrated: boolean,
    footprintCorners: number[][] = [],
    matchedZoom: number = 17,
    allFrames: any[] = []
  ) {
    if (this.resultsMap) this.resultsMap.remove();
    if (this.animationInterval) clearInterval(this.animationInterval);

    // Use real lat center, or fallback to Ukraine
    const centerLat = this.selectedBounds ? (this.selectedBounds.north + this.selectedBounds.south) / 2 : 48.5;
    const centerLng = this.selectedBounds ? (this.selectedBounds.east + this.selectedBounds.west) / 2 : 35.0;

    this.resultsMap = L.map('mapContainer', {
      center: [centerLat, centerLng],
      zoom: 12
    });

    // ESRI satellite tiles for results map
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri',
      maxZoom: 19
    }).addTo(this.resultsMap);
    
    // Labels overlay
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      attribution: '',
      maxZoom: 19,
      opacity: 0.85
    }).addTo(this.resultsMap);

    // FIX: Ensure results map also renders correctly
    setTimeout(() => {
      if (this.resultsMap) this.resultsMap.invalidateSize();
    }, 200);

    if (allFrames.length > 1) {
      if (geoCalibrated && this.selectedBounds) {
        const b = this.selectedBounds;
        L.rectangle([[b.south, b.west], [b.north, b.east]], {
          color: '#6366f1', weight: 1.5, dashArray: '4 4', fillOpacity: 0, interactive: false
        }).addTo(this.resultsMap);
      }
      this.renderMultiFrameRoute(allFrames);
      return;
    }

    if (geoCalibrated && this.selectedBounds) {
      // Draw selection area outline on results map
      const b = this.selectedBounds;
      L.rectangle([[b.south, b.west], [b.north, b.east]], {
        color: '#6366f1', weight: 1.5, dashArray: '4 4', fillOpacity: 0, interactive: false
      }).addTo(this.resultsMap);
    }

    // Trajectory comes in as [lat, lng] pairs already
    const latLngs: L.LatLngTuple[] = trajectory.map(p => [p[0], p[1]]);

    if (latLngs.length === 0) {
      this.snackBar.open('No coordinates available to display.', 'Close', { duration: 4000 });
      return;
    }

    if (latLngs.length === 1) {
      // Single geolocation: render footprint area + center marker
      this.renderGeolocationFootprint(latLngs[0], footprintCorners, matchedZoom);
      return;
    }

    // Animated polyline
    this.animatedPolyline = L.polyline([], {
      color: '#f43f5e', weight: 5, opacity: 0.9, lineJoin: 'round'
    }).addTo(this.resultsMap);

    let idx = 0;
    const step = Math.max(1, Math.ceil(latLngs.length / 60));
    this.animationInterval = setInterval(() => {
      if (idx >= latLngs.length) {
        clearInterval(this.animationInterval);
        return;
      }
      this.animatedPolyline!.setLatLngs(latLngs.slice(0, idx + 1));
      idx += step;
    }, 40);

    // Vibrant start (green) and end (red) pin markers
    const makePin = (color: string, label: string) => L.divIcon({
      html: `<div style="
        width:22px;height:32px;position:relative;
        background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);
        border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);
      "><span style="
        position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(45deg);
        font-size:10px;font-weight:700;color:white;line-height:1;
      ">${label}</span></div>`,
      className: '',
      iconSize: [22, 32],
      iconAnchor: [11, 32]
    });
    
    const greenPin = makePin('#22c55e', 'S');
    const redPin   = makePin('#ef4444', 'E');

    L.marker(latLngs[0], { icon: greenPin, draggable: true })
      .addTo(this.resultsMap)
      .bindPopup('<b>🟢 Takeoff Point</b><br>Drag to fine-tune alignment').openPopup();

    L.marker(latLngs[latLngs.length - 1], { icon: redPin })
      .addTo(this.resultsMap)
      .bindPopup('<b>🔴 Landing Point</b>');

    // Fit to path
    this.resultsMap.fitBounds(L.polyline(latLngs).getBounds().pad(0.3));

    // Compute approx GPS distance in km using Haversine
    let totalKm = 0;
    for (let i = 1; i < latLngs.length; i++) {
      totalKm += this.haversineKm(latLngs[i - 1], latLngs[i]);
    }
    this.trajectoryStats = { points: latLngs.length, distanceKm: Math.round(totalKm * 10) / 10 };
  }

  private renderGeolocationFootprint(
    center: L.LatLngTuple,
    corners: number[][],
    zoom: number
  ) {
    const map = this.resultsMap!;
    const conf = this.confidence;
    const confPct = (conf * 100).toFixed(1);

    // Confidence-based color: red (low) → yellow → green (high)
    const hue = Math.round(conf * 120); // 0=red, 60=yellow, 120=green
    const color = `hsl(${hue}, 90%, 50%)`;
    const colorLight = `hsl(${hue}, 90%, 65%)`;

    if (corners && corners.length === 4) {
      const poly = corners.map(c => [c[0], c[1]] as L.LatLngTuple);

      // Outer glow / shadow rectangle
      L.polygon(poly, {
        color: color,
        weight: 0,
        fillColor: color,
        fillOpacity: 0.08,
        interactive: false
      }).addTo(map);

      // Main footprint border
      const footprintPoly = L.polygon(poly, {
        color: color,
        weight: 3,
        dashArray: '10 5',
        fillColor: colorLight,
        fillOpacity: 0.18,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Corner marks
      corners.forEach(c => {
        L.circleMarker([c[0], c[1]] as L.LatLngTuple, {
          radius: 5,
          color: '#fff',
          weight: 2,
          fillColor: color,
          fillOpacity: 1,
          interactive: false
        }).addTo(map);
      });

      // Compute size of footprint
      const latSpan = Math.abs(corners[0][0] - corners[2][0]);
      const lngSpan = Math.abs(corners[0][1] - corners[1][1]);
      const widthM  = Math.round(lngSpan * 111320 * Math.cos(center[0] * Math.PI / 180));
      const heightM = Math.round(latSpan * 111320);

      footprintPoly.bindPopup(`
        <div style="min-width:200px; font-family: sans-serif;">
          <div style="font-size:15px; font-weight:700; margin-bottom:6px;">📸 UAV Screenshot Footprint</div>
          <div style="margin-bottom:4px;">🎯 <b>Confidence:</b> <span style="color:${color};font-weight:700">${confPct}%</span></div>
          <div style="margin-bottom:4px;">📍 <b>Center:</b> ${center[0].toFixed(6)}, ${center[1].toFixed(6)}</div>
          <div style="margin-bottom:4px;">📐 <b>Footprint:</b> ~${widthM}m × ${heightM}m</div>
          <div style="margin-bottom:4px;">🔭 <b>Matched at Zoom:</b> ${zoom}</div>
          <div style="font-size:11px; color:#888; margin-top:6px;">The highlighted area shows the estimated<br>geographic coverage of your UAV screenshot.</div>
        </div>
      `).openPopup();
    }

    // Pulsing center crosshair marker
    const pinHtml = `
      <div style="position:relative; width:32px; height:32px;">
        <div style="
          position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
          width:32px; height:32px; border-radius:50%;
          background:${color}; opacity:0.25;
          animation: uav-pulse 1.6s ease-out infinite;
        "></div>
        <div style="
          position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
          width:14px; height:14px; border-radius:50%;
          background:${color}; border:3px solid white;
          box-shadow:0 0 10px ${color};
        "></div>
      </div>`;

    L.marker(center, {
      icon: L.divIcon({ html: pinHtml, className: '', iconSize: [32, 32], iconAnchor: [16, 16] }),
      zIndexOffset: 1000
    }).addTo(map).bindPopup(`<b>📍 Center of UAV View</b><br>Lat: ${center[0].toFixed(6)}<br>Lng: ${center[1].toFixed(6)}`);

    // Zoom to show footprint with padding, fall back to pin
    if (corners && corners.length === 4) {
      const lats = corners.map(c => c[0]);
      const lngs = corners.map(c => c[1]);
      const bounds = L.latLngBounds(
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)]
      );
      map.fitBounds(bounds.pad(0.8));
    } else {
      map.setView(center, 16);
    }
  }

  private haversineKm(a: L.LatLngTuple, b: L.LatLngTuple): number {
    const R = 6371;
    const dLat = (b[0] - a[0]) * Math.PI / 180;
    const dLng = (b[1] - a[1]) * Math.PI / 180;
    const sin2 = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(sin2), Math.sqrt(1 - sin2));
  }

  // ─── Overpass Landmarks Query ───────────────────────────────────────────────

  private queryLandmarks(bounds: GeoBounds) {
    this.landmarksLoading = true;
    this.landmarks = null;
    const bbox = `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`;
    // Compact Overpass QL: count railways, waterways, places, buildings, roads, forests
    const query = `
      [out:json][timeout:20];
      (
        way["railway"](${bbox});
        way["waterway"](${bbox});
        way["natural"="water"](${bbox});
        node["place"~"village|town|city|hamlet"](${bbox});
        way["building"](${bbox});
        way["highway"~"primary|secondary|trunk"](${bbox});
        way["natural"="wood"](${bbox});
        way["landuse"="forest"](${bbox});
      );
      out tags;`;
      
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    
    this.http.get<{ elements: any[] }>(url).subscribe({
      next: (res) => {
        this.landmarks = this.parseLandmarks(res.elements);
        this.landmarksLoading = false;
        
        // Add markers for settlements to help user orient
        res.elements.filter(el => el.tags && el.tags.name && el.tags.place).forEach(place => {
          const lat = place.lat || (place.center ? place.center.lat : null);
          const lon = place.lon || (place.center ? place.center.lon : null);
          if (lat && lon && this.selectionMap) {
            const marker = L.marker([lat, lon], {
              icon: L.divIcon({
                html: `<div class="map-place-label">${place.tags.name}</div>`,
                className: 'custom-place-icon'
              })
            }).addTo(this.selectionMap);
            this.settlementMarkers.push(marker);
          }
        });
      },
      error: () => {
        this.landmarksLoading = false; // Fail silently — landmark info is non-critical
      }
    });
  }

  private parseLandmarks(elements: any[]): LandmarkSummary {
    let railways = 0, rivers = 0, settlements = 0, buildings = 0, roads = 0, forests = 0, waterBodies = 0;
    for (const el of elements) {
      const t = el.tags || {};
      if (t.railway) railways++;
      if (t.waterway) rivers++;
      if (t['natural'] === 'water') waterBodies++;
      if (t.place) settlements++;
      if (t.building) buildings++;
      if (t.highway) roads++;
      if (t['natural'] === 'wood' || t.landuse === 'forest') forests++;
    }
    return { railways, rivers, settlements, buildings, roads, forests, waterBodies };
  }

  private renderMultiFrameRoute(frames: any[]) {
    const map = this.resultsMap!;
    const successFrames = frames.filter(f => f.status === 'success');

    if (successFrames.length === 0) return;

    // 1. Draw footprint polygons for each successful frame
    successFrames.forEach((frame) => {
      const hue = Math.round((frame.confidence ?? 0) * 120);
      const color = `hsl(${hue}, 85%, 52%)`;

      if (frame.footprint_corners && frame.footprint_corners.length === 4) {
        const poly = frame.footprint_corners.map((c: any) => [c[0], c[1]] as L.LatLngTuple);
        L.polygon(poly, {
          color: color,
          weight: 2,
          dashArray: '6 4',
          fillColor: color,
          fillOpacity: 0.12,
          lineCap: 'round'
        }).addTo(map)
          .bindPopup(this.buildFramePopup(frame, frame.index + 1));
      }
    });

    // 2. Draw route polyline segments with variable width & opacity based on confidence
    for (let i = 0; i < successFrames.length - 1; i++) {
      const a = successFrames[i];
      const b = successFrames[i + 1];
      const segConf = ((a.confidence ?? 0) + (b.confidence ?? 0)) / 2;
      const hue = Math.round(segConf * 120);
      const color = `hsl(${hue}, 85%, 52%)`;

      L.polyline(
        [[a.lat!, a.lng!], [b.lat!, b.lng!]],
        {
          color: color,
          weight: 3 + segConf * 5,       // 3px to 8px
          opacity: 0.4 + segConf * 0.5,   // 0.4 to 0.9
          lineCap: 'round'
        }
      ).addTo(map);
    }

    // 3. Draw numbered markers with colors matching confidence
    successFrames.forEach((frame) => {
      const hue = Math.round((frame.confidence ?? 0) * 120);
      const color = `hsl(${hue}, 85%, 52%)`;
      const label = frame.index + 1;

      const isFirst = frame.index === 0;
      const isLast = frame.index === frames.length - 1;
      const borderColor = isFirst ? '#4caf50' : (isLast ? '#f44336' : '#ffffff');

      const iconHtml = `
        <div style="
          width: 28px; height: 28px; border-radius: 50%;
          background: ${color}; border: 3px solid ${borderColor};
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 12px; color: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        ">${label}</div>`;

      L.marker([frame.lat!, frame.lng!], {
        icon: L.divIcon({
          html: iconHtml,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        }),
        zIndexOffset: 1000 + frame.index
      }).addTo(map)
        .bindPopup(this.buildFramePopup(frame, label));
    });

    // 4. Fit to path
    const latLngs: L.LatLngTuple[] = successFrames.map(f => [f.lat!, f.lng!] as L.LatLngTuple);
    map.fitBounds(L.polyline(latLngs).getBounds().pad(0.3));

    // 5. Update stats
    let totalKm = 0;
    for (let i = 1; i < latLngs.length; i++) {
      totalKm += this.haversineKm(latLngs[i - 1], latLngs[i]);
    }
    this.trajectoryStats = { points: successFrames.length, distanceKm: Math.round(totalKm * 10) / 10 };
  }

  private buildFramePopup(frame: any, originalNumber: number): string {
    if (frame.status === 'failed') {
      return `<b>📸 Кадр ${originalNumber}</b><br>❌ Ошибка геолокации<br><small>${frame.error || ''}</small>`;
    }
    const conf = ((frame.confidence ?? 0) * 100).toFixed(1);
    const hue = Math.round((frame.confidence ?? 0) * 120);
    const color = `hsl(${hue}, 85%, 52%)`;
    return `
      <div style="min-width: 180px; font-family: sans-serif; color: #fff;">
        <b style="font-size: 14px; display: block; margin-bottom: 4px;">📸 Кадр ${originalNumber}</b>
        <span style="display: block; margin-bottom: 2px;">
          🎯 <b>Уверенность:</b> <span style="color: ${color}; font-weight: 700;">${conf}%</span>
        </span>
        <span style="display: block; margin-bottom: 2px;">
          📍 <b>Координаты:</b> ${frame.lat.toFixed(6)}, ${frame.lng.toFixed(6)}
        </span>
        <span style="display: block; opacity: 0.8; font-size: 11px;">
          🔭 Zoom: ${frame.zoom ?? 17} | Файл: ${frame.filename}
        </span>
      </div>
    `;
  }

  closeResults() {
    this.showResults = false;
    this.trajectoryStats = null;
    if (this.animationInterval) clearInterval(this.animationInterval);
    if (this.resultsMap) { this.resultsMap.remove(); this.resultsMap = null; }
    setTimeout(() => this.selectionMap?.invalidateSize(), 100);
  }

  ngOnDestroy() {
    if (this.pollSub) this.pollSub.unsubscribe();
    if (this.animationInterval) clearInterval(this.animationInterval);
    if (this.mapResizeObserver) {
      this.mapResizeObserver.disconnect();
      this.mapResizeObserver = null;
    }
    if (this.selectionMap) this.selectionMap.remove();
    if (this.resultsMap) this.resultsMap.remove();
  }
}
