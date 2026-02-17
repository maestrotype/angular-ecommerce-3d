import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef,
  Type
} from '@angular/core';

// Lazy import map — breaks the circular dependency with AppModule.
// Components are loaded on demand instead of at module initialization time.
const sectionComponentMap: { [key: string]: () => Promise<Type<any>> } = {
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
export class SectionRendererComponent implements OnInit {
  @Input() section: any;
  @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;

  ngOnInit() {
    this.renderSection();
  }

  async renderSection() {
    this.container.clear();
    const loader = sectionComponentMap[this.section?.type];
    if (loader) {
      const componentType = await loader();
      const componentRef = this.container.createComponent(componentType);
      if ('data' in componentRef.instance) {
        componentRef.instance.data = this.section;
      }
    }
  }
} 