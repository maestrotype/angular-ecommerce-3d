import { Component, OnInit } from '@angular/core';
import { ThemeService } from '../../core/themes/theme.service';
import { Theme } from '../../core/themes/theme.model';

@Component({
  selector: 'app-style-demo',
  templateUrl: './style-demo.component.html',
  styleUrls: ['./style-demo.component.scss']
})
export class StyleDemoComponent implements OnInit {
  buttonVariants = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];
  buttonSizes = ['sm', 'md', 'lg'];
  buttonStyles = ['solid', 'outline', 'ghost', 'glass'];
  
  currentTheme = 'default';
  themes: Theme[] = [];
  
  constructor(private themeService: ThemeService) {}
  
  ngOnInit() {
    this.themes = this.themeService.getAllThemes();
    this.currentTheme = this.themeService.getCurrentTheme().id;
  }
  
  changeTheme(themeId: string) {
    this.currentTheme = themeId;
    this.themeService.setTheme(themeId);
  }
} 