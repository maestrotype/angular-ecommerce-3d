import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    if (!this.name) return;

    const path = `assets/icons/${this.name}.svg`;
    fetch(path)
      .then(res => res.text())
      .then(svg => {
        const sanitized = svg
          .replace(/<svg([^>]*)>/, `<svg$1 width="${this.width}" height="${this.height}" fill="${this.fill}" stroke="${this.stroke}" stroke-width="${this.strokeWidth}" class="${this.class}">`);
        this.svgContent = this.sanitizer.bypassSecurityTrustHtml(sanitized);
      })
      .catch(err => console.error('Icon load error:', err));
  }
}
