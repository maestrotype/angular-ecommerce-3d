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
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
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
}
