import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface MenuItem {
  title: string;
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
  title: string;
  settings?: HeaderSettings;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  private apiUrl = `${environment.apiUrl}/sections`;

  constructor(private http: HttpClient) {}

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
        return of(null);
      })
    );
  }

  getMenuItems(): Observable<MenuItem[]> {
    return this.getHeaderSection().pipe(
      map(headerSection => {
        if (headerSection?.settings?.menu) {
          return headerSection.settings.menu.filter(item => item.isActive);
        }
        return [];
      })
    );
  }

  getHeaderSettings(): Observable<HeaderSettings | null> {
    return this.getHeaderSection().pipe(
      map(headerSection => headerSection?.settings || null)
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
} 