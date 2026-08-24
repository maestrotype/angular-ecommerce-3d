import { Component, Input } from '@angular/core';
import { Product } from 'src/shared/models/product.model';
import { resolveProductFromSectionContext } from 'src/shared/utils/section-product-context.util';

@Component({
  selector: 'app-product-tabs',
  templateUrl: './product-tabs.component.html',
  styleUrls: ['./product-tabs.component.scss']
})
export class ProductTabsComponent {
  @Input() product!: Product;
  
  @Input() set data(val: any) {
    const resolvedProduct = resolveProductFromSectionContext(val?.context);
    if (resolvedProduct) {
      this.product = resolvedProduct;
    }
  }

  activeTab: string = 'description';

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  get objectKeys() {
    return Object.keys;
  }
}