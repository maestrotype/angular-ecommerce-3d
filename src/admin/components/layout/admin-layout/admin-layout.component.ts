
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: 'admin-layout.component.html',
  styleUrls: ['admin-layout.component.scss'],
})
export class AdminLayoutComponent implements OnInit, OnDestroy { 
  isMobile = false;

  constructor(
    private translate: TranslateService,
    private themeService: ThemeService
  ) {
    const savedLang = localStorage.getItem('adminLang') || 'en';
    this.translate.setDefaultLang(savedLang);
    this.translate.use(savedLang);
    
    this.themeService.getCurrentTheme();
  }

  ngOnInit() {
    this.checkScreenSize();
    
    const body = document.body;
    const currentTheme = this.themeService.getCurrentTheme();
    body.setAttribute('data-theme', currentTheme);
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
  }
}
