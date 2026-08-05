import { Component, Input } from '@angular/core';

export type SkeletonVariant = 'line' | 'block' | 'circle' | 'product-card' | 'list-row';

@Component({
  selector: 'app-skeleton-loader',
  templateUrl: './skeleton-loader.component.html',
  styleUrls: ['./skeleton-loader.component.scss'],
})
export class SkeletonLoaderComponent {
  @Input() variant: SkeletonVariant = 'line';
  @Input() count = 1;
  @Input() width = '100%';
  @Input() height = '1rem';
  @Input() cardMinWidth = '250px';

  get items(): number[] {
    return Array.from({ length: Math.max(1, this.count) }, (_, index) => index);
  }
}
