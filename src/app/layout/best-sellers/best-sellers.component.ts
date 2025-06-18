import { Component, OnInit } from '@angular/core';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

@Component({
  selector: 'app-best-sellers',
  templateUrl: './best-sellers.component.html',
  styleUrls: ['./best-sellers.component.scss']
})
export class BestSellersComponent implements OnInit {
  bestSellers: Product[] = [
    {
      id: 1,
      name: 'Running Shoes',
      price: 99.99,
      image: 'assets/images/bag-1.png'
    },
    {
      id: 2,
      name: 'Running Shoes',
      price: 99.99,
      image: 'assets/images/bag-2.png'
    },
    {
      id: 3,
      name: 'Running Shoes',
      price: 99.99,
      image: 'assets/images/bag-3.png'
    },
    {
      id: 4,
      name: 'Running Shoes',
      price: 99.99,
      image: 'assets/images/bag-4.png'
    },
    {
      id: 5,
      name: 'Running Shoes',
      price: 99.99,
      image: 'assets/images/bag-5.png'
    },
    {
      id: 6,
      name: 'Running Shoes',
      price: 99.99,
      image: 'assets/images/bag.png'
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  quickView(product: Product): void {
    console.log('Quick view for product:', product);
    // Implement quick view functionality
  }
}
