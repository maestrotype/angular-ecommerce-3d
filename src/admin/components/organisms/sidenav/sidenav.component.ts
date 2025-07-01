import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../../services/auth.service";

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
}

@Component({
  selector: "app-admin-sidenav",
  templateUrl: "./sidenav.component.html",
  styleUrls: ["./sidenav.component.scss"],
})
export class SidenavComponent {
  navItems: NavItem[] = [
    { label: "Dashboard", route: "/admin/dashboard", icon: "dashboard" },
    { label: "Products", route: "/admin/products", icon: "inventory" },
    { label: "Categories", route: "/admin/categories", icon: "category" },
    {
      label: "Orders",
      route: "/admin/orders",
      icon: "shopping_cart",
      badge: 5,
    },
    { label: "Users", route: "/admin/users", icon: "people" },
  ];

  constructor(private router: Router, private authService: AuthService) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/admin/login"]);
  }
}
