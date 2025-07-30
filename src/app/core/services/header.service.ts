import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';
import { ModalService } from './modal.service';

export interface MenuItem {
  id: number;
  title: string;
  url: string;
  isActive: boolean;
  access: 'all' | 'admin' | 'closed';
  order: number;
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
  title: string;
  settings?: HeaderSettings;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  private apiUrl = `${environment.apiUrl}/sections`;

  constructor(
    private http: HttpClient,
    private modalService: ModalService
  ) {}

  getHeaderSection(): Observable<HeaderSection | null> {
    return this.http.get<HeaderSection[]>(this.apiUrl).pipe(
      map(sections => {
        const headerSection = sections.find(section => 
          section.type === 'header' && section.isActive
        );
        return headerSection || null;
      }),
      catchError(error => {
        console.error('Error fetching header section:', error);
        this.modalService.showWarning(
          'Backend Unavailable',
          'The server is currently unavailable. Some features may not work properly.',
          'Using fallback data for demonstration purposes.',
          'storefront'
        );
        return of(this.getDefaultHeaderSection());
      })
    );
  }

  getMenuItems(): Observable<MenuItem[]> {
    return this.getHeaderSection().pipe(
      map(headerSection => {
        if (headerSection?.settings?.menu) {
          return headerSection.settings.menu.filter(item => item.isActive);
        }
        return this.getDefaultMenuItems();
      })
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

  // Fallback data methods
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
        id: 1,
        title: 'Shop',
        url: '/shop',
        isActive: true,
        access: 'all',
        order: 1
      },
      {
        id: 2,
        title: 'About',
        url: '/about',
        isActive: true,
        access: 'all',
        order: 2
      },
      {
        id: 3,
        title: 'Contact',
        url: '/contact',
        isActive: true,
        access: 'all',
        order: 3
      }
    ];
  }
} 