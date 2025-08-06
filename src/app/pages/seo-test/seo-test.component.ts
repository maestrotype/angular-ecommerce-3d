import { Component, OnInit } from '@angular/core';
import { FrontendSeoService } from '../../core/services/frontend-seo.service';

@Component({
  selector: 'app-seo-test',
  template: `
    <div class="seo-test-container">
      <h1>SEO Test Page</h1>
      <p>This page is used to test SEO meta tags.</p>
      
      <div class="seo-info">
        <h2>Current SEO Settings:</h2>
        <div *ngIf="seoSettings">
          <p><strong>Site Name:</strong> {{ seoSettings.siteName }}</p>
          <p><strong>Description:</strong> {{ seoSettings.siteDescription }}</p>
          <p><strong>Keywords:</strong> {{ seoSettings.siteKeywords }}</p>
          <p><strong>URL:</strong> {{ seoSettings.siteUrl }}</p>
          <p><strong>Language:</strong> {{ seoSettings.defaultLanguage }}</p>
        </div>
        <div *ngIf="!seoSettings">
          <p>Loading SEO settings...</p>
        </div>
      </div>
      
      <button (click)="reloadSeo()">Reload SEO Settings</button>
    </div>
  `,
  styles: [`
    .seo-test-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .seo-info {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    
    button {
      background: #1976d2;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
    }
    
    button:hover {
      background: #1565c0;
    }
  `]
})
export class SeoTestComponent implements OnInit {
  seoSettings: any = null;

  constructor(private frontendSeoService: FrontendSeoService) {}

  ngOnInit(): void {
    this.loadSeoSettings();
  }

  loadSeoSettings(): void {
    this.frontendSeoService.loadAndApplySeoSettings().subscribe(settings => {
      this.seoSettings = settings;
    });
  }

  reloadSeo(): void {
    this.frontendSeoService.reloadSeoSettings().subscribe(settings => {
      this.seoSettings = settings;
    });
  }
} 