// Importing required dependencies and interfaces
import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { Product } from 'src/shared/models/product.model';
import { SectionService } from 'src/admin/services/section.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  sections: Section[] = [];
  bestSellers: Product[] = [];
  specialOffer: Product | undefined;

  constructor(private productService: ProductService, private sectionService: SectionService) {}

  // Initializing data on component load
  ngOnInit() {
    this.sectionService.getActiveSections().subscribe(sections => {
      this.sections = sections.sort((a, b) => a.order - b.order);
    });

    this.productService.getBestSellers().subscribe({
      next: (products) => this.bestSellers = products,
      error: (err) => {
        console.error('Error loading best sellers:', err);
        alert('Error loading best sellers.');
      }
    });

    this.productService.getSpecialOffers().subscribe({
      next: (products) => this.specialOffer = products[0],
      error: (err) => {
        console.error('Error loading special offers:', err);
        alert('Error loading special offers.');
      }
    });
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}