import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ViewContainerRef,
  Type
} from '@angular/core';

// Lazy import map — breaks the circular dependency with AppModule.
// Components are loaded on demand instead of at module initialization time.
const sectionComponentMap: { [key: string]: () => Promise<Type<any>> } = {
  header: () => import('../../layout/header/header.component').then(m => m.HeaderComponent),
  footer: () => import('../../layout/footer/footer.component').then(m => m.FooterComponent),
  hero: () => import('../../layout/hero/hero.component').then(m => m.HeroComponent),
  'hero-glass': () => import('../../layout/hero-glass/hero-glass.component').then(m => m.HeroGlassComponent),
  'best-sellers': () => import('../../layout/best-sellers/best-sellers.component').then(m => m.BestSellersComponent),
  categories: () => import('../../layout/categories/categories.component').then(m => m.CategoriesComponent),
  'special-offer': () => import('../../layout/special-offer/special-offer.component').then(m => m.SpecialOfferComponent),
  brands: () => import('../../layout/brands/brands.component').then(m => m.BrandsComponent),
  contacts: () => import('../../pages/contacts/contacts.component').then(m => m.ContactsComponent),
  about: () => import('../../pages/about/about.component').then(m => m.AboutComponent),
};

@Component({
  selector: 'app-section-renderer',
  templateUrl: './section-renderer.component.html',
  styleUrls: ['./section-renderer.component.scss']
})
export class SectionRendererComponent implements OnInit, OnChanges {
  @Input() section: any;
  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;

  ngOnInit() {
    this.renderSection();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['section'] && !changes['section'].firstChange) {
      this.renderSection();
    }
  }

  async renderSection() {
    if (!this.section || !this.container) return;
    
    this.container.clear();
    const loader = sectionComponentMap[this.section?.type];
    if (loader) {
      const componentType = await loader();
      const componentRef = this.container.createComponent(componentType);
      
      // Pass the entire section object to the component's data input
      if ('data' in componentRef.instance) {
        componentRef.instance.data = this.section;
      }
      
      // Force change detection
      componentRef.changeDetectorRef.markForCheck();
      componentRef.changeDetectorRef.detectChanges();
    }
  }
}