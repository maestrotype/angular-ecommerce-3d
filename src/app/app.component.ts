
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ThemeService } from './core/themes/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'angular-ecommerce';
  private adminRoute = false;

  constructor(
    private router: Router,
    private themeService: ThemeService
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.adminRoute = event.url.startsWith('/admin');
      });
  }

  ngOnInit(): void {
    // ThemeService will auto-initialize in its constructor
  }

  isAdminRoute(): boolean {
    return this.adminRoute;
  }
}
