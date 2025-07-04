import { Component, Input } from '@angular/core';
import { Product } from 'src/shared/models/product.model';

@Component({
  selector: 'app-product-tabs',
  templateUrl: './product-tabs.component.html',
  styleUrls: ['./product-tabs.component.scss']
})
export class ProductTabsComponent {
  @Input() product!: Product;
  activeTab: string = 'description';

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  get objectKeys() {
    return Object.keys;
  }
}