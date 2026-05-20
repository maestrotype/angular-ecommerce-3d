import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject, HostListener } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { filter, debounceTime } from 'rxjs/operators';
import { ThemeService } from './core/themes/theme.service';
import { FrontendSeoService } from './core/services/frontend-seo.service';
import { CartService } from './core/services/cart.service';
import { FavoritesService } from './core/services/favorites.service';
import { ModalService } from './core/services/modal.service';
import { TranslateService } from '@ngx-translate/core';
import { AnalyticsService } from './core/services/analytics.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'angular-ecommerce';
  private adminRoute = false;

  // Mobile Footer State
  isHidden = false;
  favoritesCount = 0;
  cartCount = 0;
  private cartSubscription: Subscription = new Subscription();
  private favoritesSubscription: Subscription = new Subscription();
  private scrollSubject = new Subject<void>();
  private lastScrollTop = 0;

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private frontendSeoService: FrontendSeoService,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private modalService: ModalService,
    private translate: TranslateService,
    private analyticsService: AnalyticsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Initialize localization
    this.translate.setDefaultLang('en');
    const browserLang = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('preferredLanguage') || this.translate.getBrowserLang() || 'en'
      : 'en';
    this.translate.use(browserLang.match(/en|ru|ua/) ? browserLang : 'en');

    // Debounce scroll stop logic
    this.scrollSubject.pipe(
      debounceTime(150)
    ).subscribe(() => {
      this.isHidden = false;
    });
    // Clear data-theme from body immediately when frontend loads (from admin)
    // But only if we're not in admin route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.adminRoute = event.url.startsWith('/admin');

        // Update theme based on area
        if (this.adminRoute) {
          this.themeService.updateArea('admin');
        } else {
          this.themeService.updateArea('frontend');
        }
      });
  }

  ngOnInit(): void {
    // Theme management is now handled by ThemeService

    // Load and apply SEO settings from backend
    this.frontendSeoService.reloadSeoSettings().subscribe();

    // Mobile Footer Subscriptions
    this.cartSubscription = this.cartService.getTotalCount().subscribe(
      count => this.cartCount = count
    );
    this.favoritesSubscription = this.favoritesService.favoritesCount$.subscribe(
      count => this.favoritesCount = count
    );
  }

  ngOnDestroy(): void {
    this.cartSubscription.unsubscribe();
    this.favoritesSubscription.unsubscribe();
    this.scrollSubject.complete();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    // Scroll hide logic removed to ensure mobile footer remains visible always
  }

  openAuthModal(): void {
    this.modalService.openModal({ id: 'auth', type: 'auth' });
  }

  openCartModal(): void {
    this.modalService.openModal({ id: 'cart', type: 'cart' });
  }

  openFavoritesPage(): void {
    this.router.navigate(['/favorites']);
  }

  isAdminRoute(): boolean {
    return this.adminRoute;
  }

  isViewerRoute(): boolean {
    return this.router.url.startsWith('/viewer');
  }
}
