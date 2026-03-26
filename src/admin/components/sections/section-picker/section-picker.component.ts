import { Component, EventEmitter, Output } from '@angular/core';

export interface SectionTypeOption {
  value: string;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-section-picker',
  templateUrl: './section-picker.component.html',
  styleUrls: ['./section-picker.component.scss']
})
export class SectionPickerComponent {
  @Output() sectionSelected = new EventEmitter<string>();

  sectionTypes: SectionTypeOption[] = [
    { 
      value: 'header', 
      label: 'HEADER_SECTION', 
      icon: 'view_headline', 
      description: 'The topmost site navigation and logo area.' 
    },
    { 
      value: 'footer', 
      label: 'FOOTER_SECTION', 
      icon: 'view_stream', 
      description: 'The bottom site area with copyright and links.' 
    },
    { 
      value: 'hero', 
      label: 'HERO_SECTION', 
      icon: 'view_quilt', 
      description: 'Standard hero section with title, subtitle, and image/3D.' 
    },
    { 
      value: 'hero-glass', 
      label: 'HERO_GLASS_SECTION', 
      icon: 'blur_on', 
      description: 'Luxury glass-style hero section with advanced aesthetics.' 
    },
    { 
      value: 'best-sellers', 
      label: 'BEST_SELLERS_SECTION', 
      icon: 'star', 
      description: 'Grid display of your top-selling products.' 
    },
    { 
      value: 'categories', 
      label: 'CATEGORIES_SECTION', 
      icon: 'category', 
      description: 'List of product categories with custom icons.' 
    },
    { 
      value: 'special-offer', 
      label: 'SPECIAL_OFFER_SECTION', 
      icon: 'local_offer', 
      description: 'Highlight a specific product or promotion.' 
    },
    { 
      value: 'brands', 
      label: 'BRANDS_SECTION', 
      icon: 'workspace_premium', 
      description: 'Showcase brand logos and partnerships.' 
    },
    { 
      value: 'contacts', 
      label: 'CONTACTS_SECTION', 
      icon: 'contact_page', 
      description: 'Contact form and location details.' 
    },
    { 
      value: 'about', 
      label: 'ABOUT_SECTION', 
      icon: 'info', 
      description: 'Detailed company information and mission.' 
    }
  ];

  selectSection(type: string) {
    this.sectionSelected.emit(type);
  }
}
