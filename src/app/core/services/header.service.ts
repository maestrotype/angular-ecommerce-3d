import { Injectable, Inject, PLATFORM_ID, makeStateKey, TransferState } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LocalizedString } from 'src/shared/models/localized-string.model';
import { Observable, of } from 'rxjs';
import { map, catchError, tap, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { Section } from 'src/shared/models/section.model';
import { mergeHeaderMenuWithHomeSections } from 'src/shared/utils/section-nav.util';

const HEADER_KEY = makeStateKey<Section[]>('header_sections');

export interface MenuItem {
  title: string | LocalizedString;
  url: string;
  access: 'all' | 'admin' | 'closed';
  isActive: boolean;
}

export interface HeaderSettings {
  logoUrl?: string;
  showSearch?: boolean;
  showCart?: boolean;
  showProfile?: boolean;
  menu?: MenuItem[];
}

export interface HeaderSection {
  id: number;
  type: string;
  title: string | LocalizedString;
  settings?: HeaderSettings;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  private apiUrl = `${environment.apiUrl}/sections`;
  private sections$?: Observable<Section[]>;

  constructor(
    private http: HttpClient,
    private state: TransferState,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  getHeaderSection(): Observable<HeaderSection | null> {
    return this.loadSections().pipe(
      map(sections => this.processSections(sections)),
      catchError(error => {
        console.error('Error loading header section:', error);
        return of(this.getDefaultHeaderSection());
      })
    );
  }

  private loadSections(): Observable<Section[]> {
    if (!this.sections$) {
      this.sections$ = this.fetchSections().pipe(shareReplay(1));
    }
    return this.sections$;
  }

  private fetchSections(): Observable<Section[]> {
    if (this.state.hasKey(HEADER_KEY)) {
      const sections = this.state.get(HEADER_KEY, []);
      if (isPlatformBrowser(this.platformId)) {
        this.state.remove(HEADER_KEY);
      }
      return of(sections);
    }

    return this.http.get<Section[]>(this.apiUrl).pipe(
      tap(sections => {
        if (!isPlatformBrowser(this.platformId)) {
          this.state.set(HEADER_KEY, sections);
        }
      }),
      catchError(error => {
        console.error('Error loading sections for header:', error);
        return of([]);
      })
    );
  }

  private processSections(sections: Section[]): HeaderSection | null {
    const headerSection = sections.find(section =>
      section.type === 'header' && section.isActive
    );
    return (headerSection as HeaderSection) || null;
  }

  getMenuItems(): Observable<MenuItem[]> {
    return this.loadSections().pipe(
      map(sections => {
        const headerSection = this.processSections(sections);
        const configured = headerSection?.settings?.menu?.filter(item => item.isActive)
          ?? this.getDefaultMenuItems();
        const homeSections = sections.filter(
          section => section.type !== 'header' && section.type !== 'footer'
        );
        return mergeHeaderMenuWithHomeSections(configured, homeSections);
      }),
      catchError(() => of(this.getDefaultMenuItems()))
    );
  }

  getHeaderSettings(): Observable<HeaderSettings | null> {
    return this.getHeaderSection().pipe(
      map(headerSection => headerSection?.settings || this.getDefaultHeaderSettings())
    );
  }

  shouldShowElement(elementType: 'search' | 'cart' | 'profile'): Observable<boolean> {
    return this.getHeaderSettings().pipe(
      map(settings => {
        if (!settings) return true; // Default to showing if no settings

        switch (elementType) {
          case 'search':
            return settings.showSearch !== false;
          case 'cart':
            return settings.showCart !== false;
          case 'profile':
            return settings.showProfile !== false;
          default:
            return true;
        }
      })
    );
  }

  canAccessMenuItem(menuItem: MenuItem, userRole?: string): boolean {
    if (!menuItem.isActive) return false;

    switch (menuItem.access) {
      case 'all':
        return true;
      case 'admin':
        return userRole === 'admin';
      case 'closed':
        return false;
      default:
        return true;
    }
  }

  private getDefaultHeaderSection(): HeaderSection {
    return {
      id: 1,
      type: 'header',
      title: 'Default Header',
      isActive: true,
      settings: this.getDefaultHeaderSettings()
    };
  }

  private getDefaultHeaderSettings(): HeaderSettings {
    return {
      showSearch: true,
      showCart: true,
      showProfile: true,
      menu: this.getDefaultMenuItems()
    };
  }

  private getDefaultMenuItems(): MenuItem[] {
    return [
      {
        title: 'Home',
        url: '/home',
        access: 'all',
        isActive: true
      },
      {
        title: 'Shop',
        url: '/shop',
        access: 'all',
        isActive: true
      },
      {
        title: 'About',
        url: '/about',
        access: 'all',
        isActive: true
      },
      {
        title: 'Contacts',
        url: '/contacts',
        access: 'all',
        isActive: true
      },
      {
        title: 'Admin Panel',
        url: '/admin',
        access: 'admin',
        isActive: true
      }
    ];
  }
}