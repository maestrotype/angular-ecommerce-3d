
import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
}

@Component({
  selector: 'app-admin-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent {
  @Output() closeSidenav = new EventEmitter<void>();

  navItems: NavItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Products', route: '/admin/products', icon: 'inventory' },
    { label: 'Categories', route: '/admin/categories', icon: 'category' },
    { label: 'Orders', route: '/admin/orders', icon: 'shopping_cart', badge: 5 },
    { label: 'Users', route: '/admin/users', icon: 'people' }
  ];

  constructor(private router: Router) {}

  onNavClick(): void {
    this.closeSidenav.emit();
  }

  logout(): void {
    // Implement logout logic
    localStorage.removeItem('admin_token');
    this.router.navigate(['/admin/login']);
  }
}
