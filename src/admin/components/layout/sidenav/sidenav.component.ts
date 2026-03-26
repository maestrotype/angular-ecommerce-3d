import { Component, Output, EventEmitter, OnInit, OnDestroy, Inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from '@angular/common';
import { Router } from "@angular/router";
import { AuthService } from "../../../services/auth.service";
import { OrderService } from "../../../services/order.service";
import { ThemeService } from "../../../../app/core/themes/theme.service";
import { TranslateService } from "@ngx-translate/core";
import { Theme } from "../../../../app/core/themes/theme.model";
import { Subject, Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { User } from "../../../../shared/models/user.model";

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: "app-admin-sidenav",
  templateUrl: "./sidenav.component.html",
  styleUrls: ["./sidenav.component.scss"]
})
export class SidenavComponent implements OnInit, OnDestroy {
  @Output() closeSidenav = new EventEmitter<void>();

  private destroy$ = new Subject<void>();
  isMobile = false;
  user$: Observable<User | null>;

  // Language customization
  languages = [
    { code: 'en', label: 'EN' },
    { code: 'ru', label: 'RU' },
    { code: 'ua', label: 'UA' }
  ];
  currentLang = 'en';

  // Theme switching
  themes: Theme[] = [];
  currentTheme = 'light';

  navItems: NavItem[] = [
    { label: "DASHBOARD", route: "/admin/dashboard", icon: "dashboard" },
    { label: "PRODUCTS", route: "/admin/products", icon: "inventory" },
    { label: "CATEGORIES", route: "/admin/categories", icon: "category" },
    {
      label: "ADMIN_NAV_ORDERS",
      route: "/admin/orders",
      icon: "shopping_cart",
    },
    { label: "USERS", route: "/admin/users", icon: "people" },
    { label: "MESSAGES", route: "/admin/messages", icon: "email" },
    { label: "PAGE_SECTIONS", route: "/admin/sections", icon: "view_module" },
    { label: "SEO", route: "/admin/seo", icon: "search" },
    { label: "PAYMENTS", route: "/admin/payments", icon: "payment" },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private orderService: OrderService,
    private themeService: ThemeService,
    public translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.currentLang = this.translate.currentLang || this.translate.getDefaultLang() || 'en';
    this.user$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadThemes();

    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('resize', this.checkScreenSize.bind(this));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.checkScreenSize.bind(this));
    }
  }

  private checkScreenSize(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= 768;
    }
  }

  private loadThemes(): void {
    this.themes = this.themeService.getThemesByArea('admin');
    this.currentTheme = this.themeService.getCurrentAdminTheme().id;

    this.themeService.adminTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.currentTheme = theme.id;
      });
  }

  changeTheme(themeId: string): void {
    this.themeService.setTheme(themeId, 'admin');
  }

  changeLanguage(langCode: string): void {
    this.currentLang = langCode;
    this.translate.use(langCode);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('preferredLanguage', langCode);
    }
  }


  onNavItemClick(): void {
    if (window.innerWidth <= 768) {
      this.closeSidenav.emit();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/admin/login"]);
  }
}
