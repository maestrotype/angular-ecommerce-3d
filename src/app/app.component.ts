
import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ThemeService } from './core/themes/theme.service';
import { FrontendSeoService } from './core/services/frontend-seo.service';

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
    private themeService: ThemeService,
    private frontendSeoService: FrontendSeoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Clear data-theme from body immediately when frontend loads (from admin)
    // But only if we're not in admin route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.adminRoute = event.url.startsWith('/admin');

        // Only clear admin theme if we're switching to frontend
        if (!this.adminRoute && isPlatformBrowser(this.platformId)) {
          document.body.removeAttribute('data-theme');
        }
      });
  }

  ngOnInit(): void {
    // Watch for data-theme changes on body and remove them
    // But only if we're not in admin route (browser only)
    if (isPlatformBrowser(this.platformId)) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
            const body = mutation.target as HTMLElement;
            if (body.tagName === 'BODY' && body.getAttribute('data-theme') === 'dark' && !this.adminRoute) {
              body.removeAttribute('data-theme');
            }
          }
        });
      });

      observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
    }

    // Load and apply SEO settings from backend
    this.frontendSeoService.reloadSeoSettings().subscribe();
  }

  isAdminRoute(): boolean {
    return this.adminRoute;
  }
}
