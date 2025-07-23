
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-layout',
  templateUrl: 'admin-layout.component.html',
  styleUrls: ['admin-layout.component.scss'],
})
export class AdminLayoutComponent { 
  constructor(private translate: TranslateService) {
    const savedLang = localStorage.getItem('adminLang') || 'en';
    this.translate.setDefaultLang(savedLang);
    this.translate.use(savedLang);
  }
}
