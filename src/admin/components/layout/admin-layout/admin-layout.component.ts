
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../../../app/core/themes/theme.service';

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
  }

  ngOnInit() {
    this.checkScreenSize();
    this.initializeAdminTheme();
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

  /**
   * Initialize theme for admin panel
   * Ensures admin panel uses dark theme for better UX
   */
  private initializeAdminTheme(): void {
    // Force dark theme for admin panel
    const adminTheme = 'dark';
    console.log('Admin panel theme initialization: forcing dark theme');
    
    // Set dark theme for admin panel
    this.themeService.setTheme(adminTheme);
    
    // Also set data-theme attribute directly to ensure CSS variables are applied
    document.documentElement.setAttribute('data-theme', adminTheme);
  }
}
