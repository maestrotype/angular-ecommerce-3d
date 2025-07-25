import {
    Component,
    Input,
    OnInit,
    ViewChild,
    ViewContainerRef,
    ComponentFactoryResolver,
    Type
  } from '@angular/core';
  
  import { HeroComponent } from '../../layout/hero/hero.component';
  import { HeroGlassComponent } from '../../layout/hero-glass/hero-glass.component';
  import { BestSellersComponent } from '../../layout/best-sellers/best-sellers.component';
  import { CategoriesComponent } from '../../layout/categories/categories.component';
  import { SpecialOfferComponent } from '../../layout/special-offer/special-offer.component';
  import { BrandsComponent } from '../../layout/brands/brands.component';
  import { ContactsComponent } from '../../layout/contacts/contacts.component';
  import { AboutComponent } from '../../pages/about/about.component';
  
  const sectionComponentMap: { [key: string]: Type<any> } = {
    hero: HeroComponent,
    'hero-glass': HeroGlassComponent,
    'best-sellers': BestSellersComponent,
    categories: CategoriesComponent,
    'special-offer': SpecialOfferComponent,
    brands: BrandsComponent,
    contacts: ContactsComponent,
    about: AboutComponent,
  };
  
  @Component({
    selector: 'app-section-renderer',
    templateUrl: './section-renderer.component.html',
    styleUrls: ['./section-renderer.component.scss']
  })
  export class SectionRendererComponent implements OnInit {
    @Input() section: any;
    @ViewChild('container', { read: ViewContainerRef, static: true }) container!: ViewContainerRef;
  
    constructor(private resolver: ComponentFactoryResolver) {}
  
    ngOnInit() {
      this.renderSection();
    }
  
    renderSection() {
      this.container.clear();
      const componentType = sectionComponentMap[this.section?.type];
      if (componentType) {
        const factory = this.resolver.resolveComponentFactory(componentType);
        const componentRef = this.container.createComponent(factory);
        if ('data' in componentRef.instance) {
          componentRef.instance.data = this.section;
        }
      }
    }
  }