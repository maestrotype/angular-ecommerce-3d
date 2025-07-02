
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from '../../../models/product.model';


@Component({
  selector: 'app-product-form',
  templateUrl: 'product-form.component.html',
  styleUrl: 'product-form.component.scss'
})
export class ProductFormComponent implements OnInit {
    productForm: FormGroup;
    isEditMode = false;
    isLoading = false;
    productId: number | null = null;
  
    constructor(
      private fb: FormBuilder,
      private router: Router,
      private route: ActivatedRoute,
      private snackBar: MatSnackBar
    ) {
      this.productForm = this.createForm();
    }
  
    ngOnInit(): void {
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.productId = +params['id'];
          this.isEditMode = true;
          this.loadProduct(this.productId);
        }
      });
    }
  
    createForm(): FormGroup {
      return this.fb.group({
        name: ['', [Validators.required]],
        category: ['', [Validators.required]],
        price: [0, [Validators.required, Validators.min(0.01)]],
        stock: [0, [Validators.required, Validators.min(0)]],
        imageUrl: [''],
        description: ['', [Validators.required]],
        specifications: this.fb.array([])
      });
    }
  
    get specificationsArray(): FormArray {
      return this.productForm.get('specifications') as FormArray;
    }
  
    addSpecification(): void {
      const specGroup = this.fb.group({
        key: ['', Validators.required],
        value: ['', Validators.required]
      });
      this.specificationsArray.push(specGroup);
    }
  
    removeSpecification(index: number): void {
      this.specificationsArray.removeAt(index);
    }
  
    loadProduct(id: number): void {
      // Mock data loading - replace with actual service call
      const mockProduct: Product = {
        id: id,
        name: 'Sample Product',
        category: 'electronics',
        price: 99.99,
        stock: 50,
        imageUrl: '/assets/images/sample.jpg',
        description: 'Sample product description',
        specifications: { brand: 'TechCorp', model: 'TC-100' }
      };
  
      this.populateForm(mockProduct);
    }
  
    populateForm(product: Product): void {
      this.productForm.patchValue({
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        description: product.description
      });
  
      // Populate specifications
      if (product.specifications) {
        Object.entries(product.specifications).forEach(([key, value]) => {
          const specGroup = this.fb.group({
            key: [key, Validators.required],
            value: [value, Validators.required]
          });
          this.specificationsArray.push(specGroup);
        });
      }
    }
  
    onSubmit(): void {
      if (this.productForm.valid) {
        this.isLoading = true;
        const formValue = this.productForm.value;
  
        // Convert specifications array to object
        const specifications: { [key: string]: string } = {};
        formValue.specifications.forEach((spec: any) => {
          if (spec.key && spec.value) {
            specifications[spec.key] = spec.value;
          }
        });
  
        const productData = {
          ...formValue,
          specifications
        };
  
        // Mock API call - replace with actual service
        setTimeout(() => {
          this.isLoading = false;
          const message = this.isEditMode ? 'Product updated successfully!' : 'Product created successfully!';
          this.snackBar.open(message, 'Close', { duration: 3000 });
          this.router.navigate(['/admin/products']);
        }, 1000);
      }
    }
  
    goBack(): void {
      this.router.navigate(['/admin/products']);
    }
  }