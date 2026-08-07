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
import { MobileMenuService } from './core/services/mobile-menu.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'angular-ecommerce';
  private adminRoute = false;
  private skipInitialPageTransition = true;
  pageEntering = false;
  private pageTransitionTimer: ReturnType<typeof setTimeout> | null = null;

  private static readonly PAGE_TRANSITION_MAX_MS = 700;

  // Mobile Footer State
  isHidden = false;
  isMobileMenuOpen = false;
  favoritesCount = 0;
  cartCount = 0;
  private cartSubscription: Subscription = new Subscription();
  private favoritesSubscription: Subscription = new Subscription();
  private mobileMenuSubscription: Subscription = new Subscription();
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
    private mobileMenuService: MobileMenuService,
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
    this.mobileMenuSubscription = this.mobileMenuService.isOpen$.subscribe(
      open => this.isMobileMenuOpen = open
    );
  }

  ngOnDestroy(): void {
    this.cartSubscription.unsubscribe();
    this.favoritesSubscription.unsubscribe();
    this.mobileMenuSubscription.unsubscribe();
    this.scrollSubject.complete();
    this.clearPageTransitionTimer();
  }

  onRouteActivate(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.skipInitialPageTransition) {
      this.skipInitialPageTransition = false;
      return;
    }

    if (this.isAdminRoute() || this.isViewerRoute()) {
      return;
    }

    this.triggerPageTransition();
  }

  private triggerPageTransition(): void {
    this.clearPageTransitionTimer();
    this.pageEntering = false;

    requestAnimationFrame(() => {
      this.pageEntering = true;
      this.pageTransitionTimer = setTimeout(() => {
        this.pageEntering = false;
        this.pageTransitionTimer = null;
      }, AppComponent.PAGE_TRANSITION_MAX_MS);
    });
  }

  private clearPageTransitionTimer(): void {
    if (this.pageTransitionTimer !== null) {
      clearTimeout(this.pageTransitionTimer);
      this.pageTransitionTimer = null;
    }
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    // Scroll hide logic removed to ensure mobile footer remains visible always
  }

  openAuthModal(): void {
    this.mobileMenuService.close();
    this.modalService.openModal({ id: 'auth', type: 'auth' });
  }

  openCartModal(): void {
    this.mobileMenuService.close();
    this.modalService.openModal({ id: 'cart', type: 'cart' });
  }

  openFavoritesPage(): void {
    this.mobileMenuService.close();
    this.router.navigate(['/favorites']);
  }

  isAdminRoute(): boolean {
    return this.adminRoute;
  }

  isViewerRoute(): boolean {
    return this.router.url.startsWith('/viewer');
  }
}
