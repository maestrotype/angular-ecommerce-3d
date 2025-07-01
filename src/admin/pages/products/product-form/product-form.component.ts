
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from 'src/shared/models/product.model';


@Component({
  selector: 'app-product-form',
  templateUrl: 'product-form.component.html',
  styleUrl: 'product-form.component.scss'
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  productId?: number;

  categories = [
    'Smartphones',
    'Laptops',
    'Tablets',
    'Headphones',
    'Cameras',
    'Gaming',
    'Home & Garden',
    'Sports',
    'Fashion'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.productForm = this.createForm();
  }

  get featuresArray(): FormArray {
    return this.productForm.get('features') as FormArray;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.productId = +params['id'];
        this.loadProduct(this.productId);
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.min(0)]],
      imageUrl: [''],
      features: this.fb.array([]),
      specifications: this.fb.group({
        brand: [''],
        model: ['']
      })
    });
  }

  loadProduct(id: number): void {
    // Mock data - replace with actual service call
    const mockProduct: Product = {
      id: 1,
      name: 'Samsung Galaxy S23',
      category: 'Smartphones',
      price: 899.99,
      stock: 25,
      description: 'Latest Samsung flagship smartphone with advanced features',
      specifications: { brand: 'Samsung', model: 'Galaxy S23' },
      imageUrl: '/placeholder.jpg',
      features: ['5G Connectivity', 'Triple Camera System', '120Hz Display']
    };

    this.patchFormWithProduct(mockProduct);
  }

  patchFormWithProduct(product: Product): void {
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      specifications: product.specifications
    });

    // Add features
    if (product.features) {
      product.features.forEach(feature => {
        this.featuresArray.push(this.fb.control(feature));
      });
    }
  }

  addFeature(): void {
    this.featuresArray.push(this.fb.control(''));
  }

  removeFeature(index: number): void {
    this.featuresArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.isSubmitting = true;
      
      const formValue = this.productForm.value;
      const product: Partial<Product> = {
        ...formValue,
        id: this.isEditMode ? this.productId : undefined,
        features: formValue.features.filter((f: string) => f.trim() !== '')
      };

      // TODO: Replace with actual service calls
      setTimeout(() => {
        console.log('Product data:', product);
        this.isSubmitting = false;
        
        const message = this.isEditMode ? 'Product updated successfully' : 'Product created successfully';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        
        this.router.navigate(['/admin/products']);
      }, 1000);
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/products']);
  }
}
