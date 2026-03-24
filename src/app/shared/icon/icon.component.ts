import { Component, Input, OnInit, Inject, PLATFORM_ID, makeStateKey, TransferState } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser, Location } from '@angular/common';

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
    private location: Location,
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
    // For GitHub Pages or subdirectory hosting, we MUST use prepareExternalUrl
    const finalPath = this.location.prepareExternalUrl(iconPath);

    this.http.get(finalPath, { responseType: 'text' }).subscribe({
      next: (svgContent: string) => {
        // Strip everything before the first <svg tag (like XML declarations)
        const svgStartIndex = svgContent.toLowerCase().indexOf('<svg');
        if (svgStartIndex === -1) {
          console.error(`Invalid SVG content for icon ${this.name}`);
          return;
        }
        
        const cleanSvg = svgContent.substring(svgStartIndex);
        // Stripping the opening <svg ...> tag while preserving inner content
        const innerContent = cleanSvg.replace(/<svg[^>]*>/i, '');
        
        // Construct the new SVG with our desired attributes
        const finalSvg = `<svg width="${this.width}" height="${this.height}" viewBox="0 0 24 24" fill="${this.fill}" stroke="${this.stroke}" stroke-width="${this.strokeWidth}" class="${this.class}">${innerContent}`;
        
        this.svgContent = this.sanitizer.bypassSecurityTrustHtml(finalSvg);

        if (!isPlatformBrowser(this.platformId)) {
          this.transferState.set(key, finalSvg);
        }
      },
      error: (error) => {
        console.error(`Error loading icon ${this.name}:`, error);
      }
    });
  }
}
