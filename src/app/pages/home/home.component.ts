// Importing required dependencies and interfaces
import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  bestSellers: Product[] = [];
  specialOffer: Product | undefined;

  constructor(private productService: ProductService) {}

  // Initializing data on component load
  ngOnInit() {
    this.bestSellers = this.productService.getBestSellers();
    this.specialOffer = this.productService.getSpecialOffers()[0];
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