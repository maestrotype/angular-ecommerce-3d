import { Component, Input, OnInit, Inject, PLATFORM_ID, makeStateKey, TransferState } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
})
export class IconComponent implements OnInit {
  @Input() name!: string;
  @Input() width = 24;
  @Input() height = 24;
  @Input() fill = 'none';
  @Input() stroke = 'currentColor';
  @Input() strokeWidth = 2;
  @Input() class = '';

  svgContent: SafeHtml = '';

  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    this.loadIcon();
  }

  private loadIcon() {
    if (!this.name) return;

    const key = makeStateKey<string>(`icon_${this.name}_${this.width}_${this.height}_${this.fill}_${this.stroke}_${this.strokeWidth}`);

    if (this.transferState.hasKey(key)) {
      const storedSvg = this.transferState.get(key, '');
      this.svgContent = this.sanitizer.bypassSecurityTrustHtml(storedSvg);
      return;
    }

    const iconPath = `assets/icons/${this.name}.svg`;
    // On server, we might need a full URL or absolute path, but HttpClient (withFetch) 
    // in Angular 17 SSR often handles assets if configured. 
    // To be safe, let's assume it works or falls back.

    this.http.get(iconPath, { responseType: 'text' }).subscribe({
      next: (svgContent) => {
        const sanitized = svgContent.replace(/<svg([^>]*)>/, `<svg$1 width="${this.width}" height="${this.height}" fill="${this.fill}" stroke="${this.stroke}" stroke-width="${this.strokeWidth}" class="${this.class}">`);
        this.svgContent = this.sanitizer.bypassSecurityTrustHtml(sanitized);

        if (!isPlatformBrowser(this.platformId)) {
          this.transferState.set(key, sanitized);
        }
      },
      error: (error) => {
        console.error(`Error loading icon ${this.name}:`, error);
      }
    });
  }
}
