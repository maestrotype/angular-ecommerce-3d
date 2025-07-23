import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../../../services/auth.service";
import { OrderService } from "../../../services/order.service";

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
    { label: "DASHBOARD", route: "/admin/dashboard", icon: "dashboard" },
    { label: "PRODUCTS", route: "/admin/products", icon: "inventory" },
    { label: "CATEGORIES", route: "/admin/categories", icon: "category" },
    {
      label: "ORDERS",
      route: "/admin/orders",
      icon: "shopping_cart",
      badge: 0,
    },
    { label: "USERS", route: "/admin/users", icon: "people" },
    { label: "MESSAGES", route: "/admin/messages", icon: "email" },
    { label: "PAGE_SECTIONS", route: "/admin/sections", icon: "view_module" },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.loadPendingOrdersCount();
  }

  loadPendingOrdersCount(): void {
    this.orderService.getPendingOrdersCount().subscribe(count => {
      const ordersNav = this.navItems.find(item => item.label === "ORDERS");
      if (ordersNav) {
        ordersNav.badge = count;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/admin/login"]);
  }
}
