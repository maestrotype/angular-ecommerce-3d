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
  cropVideo: boolean = true;
  taskPrompt: string = '';

  isProcessing: boolean = false;
  loadingProgress: number = 0;
  currentAction: string = '';
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
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          this.referenceImageFile = file;
          this.snackBar.open('Image pasted from clipboard!', 'OK', { duration: 2000 });
          return; // Process only first image
        }
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
          this.snackBar.open(
            `✅ Зона ${areaKm2.toFixed(1)} км² выбрана! Загрузите скриншот и нажмите "Геолоцировать".`,
            'OK', { duration: 3000 }
          );
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
    this.selectedBounds = null;
    this.landmarks = null;
    this.taskId = null;
    this.isProcessing = false;
    this.loadingProgress = 0;
    this.currentAction = '';
    this.showResults = false;
    this.taskPrompt = '';
    
    this.clearSelection();
    if (this.pollSub) this.pollSub.unsubscribe();
    this.snackBar.open('All data cleared.', 'OK', { duration: 2000 });
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

  getFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  // ─── Processing ──────────────────────────────────────────────────────────────

  geolocateCurrentScreenshot() {
    if (!this.referenceImageFile || !this.selectedBounds || this.isProcessing) return;

    this.isProcessing = true;
    this.loadingProgress = 10;
    this.currentAction = 'Locating screenshot on map...';

    this.uavService.geolocateImage(this.referenceImageFile, this.selectedBounds).subscribe({
      next: (res) => {
        this.isProcessing = false;
        if (res.status === 'success') {
          this.snackBar.open('Screenshot located! Placed pin on map.', 'Close', { duration: 5000 });
          this.showResults = true;
          this.confidence = res.confidence;
          this.textAnalysis = `Screenshot successfully geolocated with ${(res.confidence * 100).toFixed(1)}% confidence. Location found at coordinates: ${res.lat.toFixed(6)}, ${res.lng.toFixed(6)}.`;
          
          // Render on map as a single point
          setTimeout(() => this.initResultsMap([[res.lat, res.lng]], true), 150);
        } else {
          this.snackBar.open('Geolocation failed: ' + res.error, 'Close', { duration: 7000 });
        }
      },
      error: (err) => {
        this.isProcessing = false;
        this.snackBar.open('API Error: ' + err.message, 'Close', { duration: 5000 });
      }
    });
  }

  startProcessing() {
    if (!this.videoFile || !this.selectedBounds || this.isProcessing) return;

    this.isProcessing = true;
    this.loadingProgress = 0;
    this.textAnalysis = null;

    this.uavService.processVideo(this.videoFile, this.cropVideo, this.selectedBounds, this.referenceImageFile, this.taskPrompt).subscribe({
      next: (res) => {
        this.taskId = res.task_id;
        this.pollStatus();
      },
      error: (err) => {
        this.isProcessing = false;
        this.snackBar.open('Failed to start processing: ' + err.message, 'Close', { duration: 5000 });
      }
    });
  }

  stopProcessing() {
    if (!this.taskId || !this.isProcessing) return;
    
    this.uavService.stopTask(this.taskId).subscribe({
      next: () => {
        this.isProcessing = false;
        if (this.pollSub) this.pollSub.unsubscribe();
        this.snackBar.open('Process stopped by user.', 'OK', { duration: 3000 });
        this.currentAction = '🛑 Stopped';
      },
      error: (err) => {
        this.snackBar.open('Failed to stop: ' + (err.message || 'Unknown error'), 'Close', { duration: 5000 });
      }
    });
  }

  private pollStatus() {
    this.pollSub = interval(2000).subscribe(() => {
      if (!this.taskId) return;

      this.uavService.getTaskStatus(this.taskId).subscribe({
        next: (status) => {
          this.loadingProgress = status.progress || 0;
          this.currentAction = status.current_action || 'Processing...';

          if (status.status === 'success') {
            this.isProcessing = false;
            if (this.pollSub) this.pollSub.unsubscribe();
            this.snackBar.open('Mapping complete! GPS trajectory ready.', 'Close', { duration: 5000 });
            this.showResults = true;
            if (status.text_analysis) {
              this.textAnalysis = status.text_analysis;
            }
            setTimeout(() => this.loadTrajectoryAndRender(status.model_url!), 150);

          } else if (status.status === 'failed') {
            this.isProcessing = false;
            if (this.pollSub) this.pollSub.unsubscribe();
            const msg = status.error || 'Unknown error';
            this.snackBar.open('Mapping failed: ' + msg, 'Close', { duration: 10000 });
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

  private initResultsMap(trajectory: [number, number][], geoCalibrated: boolean) {
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
      // Single geolocation point
      L.marker(latLngs[0], { 
        icon: L.divIcon({
          html: '<div class="geolocate-pin">📍</div>',
          className: 'custom-geo-icon'
        }) 
      }).addTo(this.resultsMap)
        .bindPopup(`<b>📍 Located Position</b><br>Confidence: ${(this.confidence * 100).toFixed(1)}%`)
        .openPopup();
      
      this.resultsMap.setView(latLngs[0], 17);
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
