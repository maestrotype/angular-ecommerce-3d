import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { resolveUiLanguage } from 'src/shared/utils/ui-language.util';

@Component({
  selector: 'app-admin-layout',
  templateUrl: 'admin-layout.component.html',
  styleUrls: ['admin-layout.component.scss'],
})
export class AdminLayoutComponent implements OnInit, OnDestroy { 
  isMobile = false;

  constructor(private translate: TranslateService) {
    const savedLang = resolveUiLanguage(
      localStorage.getItem('adminLang') || localStorage.getItem('preferredLanguage') || 'en'
    );
    this.translate.setDefaultLang('en');
    this.translate.use(savedLang);
  }

  ngOnInit() {
    this.checkScreenSize();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth <= 1024;
  }
}
