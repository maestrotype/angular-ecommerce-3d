import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormArray } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
} from "../../../models/product.model";
import { ProductService } from "../../../services/product.service";

@Component({
  selector: "app-product-form",
  templateUrl: "./product-form.component.html",
  styleUrls: ["./product-form.component.scss"],
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  isUploading = false;
  productId: number | null = null;
  selectedImageUrl: string | null = null;
  imageUrls: string[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private productService: ProductService
  ) {
    this.productForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params["id"]) {
        this.productId = +params["id"];
        this.isEditMode = true;
        this.loadProduct(this.productId);
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ["", [Validators.required, Validators.minLength(2)]],
      category: ["", [Validators.required]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      imageUrl: [""],
      description: ["", [Validators.required, Validators.minLength(10)]],
      specifications: this.fb.array([]),
    });
  }

  get specificationsArray(): FormArray {
    return this.productForm.get("specifications") as FormArray;
  }

  addSpecification(): void {
    const specGroup = this.fb.group({
      key: ["", Validators.required],
      value: ["", Validators.required],
    });
    this.specificationsArray.push(specGroup);
  }

  removeSpecification(index: number): void {
    this.specificationsArray.removeAt(index);
  }

  onFilesSelected(event: any): void {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;
  
    Array.from(files).forEach(file => {
      if (!file.type.match(/image\/(png|jpg|jpeg)/) || file.size > 5 * 1024 * 1024) return;

      this.isUploading = true;
      this.productService.uploadImage(file).subscribe({
        next: (response) => {
          if (response.url) {
            this.imageUrls.push(response.url);
          }
          this.isUploading = false;
        },
        error: () => { this.isUploading = false; }
      });
    });
  }  

  removeImageAt(index: number): void {
    this.imageUrls.splice(index, 1);
  }

  loadProduct(id: number): void {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.populateForm(product);
        this.selectedImageUrl = product.imageUrl;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading product:", err);
        this.snackBar.open("Error loading product", "Close", {
          duration: 5000,
          panelClass: ["error-snackbar"],
        });
        this.isLoading = false;
      },
    });
  }

  populateForm(product: Product): void {
    this.productForm.patchValue({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      description: product.description,
    });

    // Clear existing specifications
    while (this.specificationsArray.length !== 0) {
      this.specificationsArray.removeAt(0);
    }

    // Populate specifications
    if (product.specifications) {
      Object.entries(product.specifications).forEach(([key, value]) => {
        const specGroup = this.fb.group({
          key: [key, Validators.required],
          value: [value, Validators.required],
        });
        this.specificationsArray.push(specGroup);
      });
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      this.snackBar.open(
        "Please fill in all required fields correctly",
        "Close",
        {
          duration: 3000,
          panelClass: ["error-snackbar"],
        }
      );
      return;
    }
  
    if (!this.imageUrls.length) {
      this.snackBar.open(
        "Please upload at least one image before submitting",
        "Close",
        {
          duration: 3000,
          panelClass: ["error-snackbar"],
        }
      );
      return;
    }
  
    this.isLoading = true;
    const formValue = this.productForm.value;
  
    const specifications: { [key: string]: string } = {};
    formValue.specifications.forEach((spec: any) => {
      if (spec.key && spec.value) {
        specifications[spec.key] = spec.value;
      }
    });
  
    const productData = {
      ...formValue,
      imageUrl: this.imageUrls[0],
      images: this.imageUrls,
      specifications,
    };
  
    console.log("Submitting product data:", productData);
  
    if (this.isEditMode && this.productId) {
      this.updateProduct(this.productId, productData);
    } else {
      this.createProduct(productData);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      if (control) {
        control.markAsTouched();
        if (control instanceof FormGroup) {
          this.markFormGroupTouched(control);
        }
      }
    });
  }

  createProduct(productData: ProductCreateRequest): void {
    this.productService.createProduct(productData).subscribe({
      next: (product) => {
        console.log("Product created:", product);
        this.isLoading = false;
        this.snackBar.open("Product created successfully!", "Close", {
          duration: 3000,
          panelClass: ["success-snackbar"],
        });
        this.router.navigate(["/admin/products"]);
      },
      error: (err) => {
        console.error("Error creating product:", err);
        this.isLoading = false;
        this.snackBar.open(
          "Error creating product: " + (err.error?.message || err.message),
          "Close",
          {
            duration: 5000,
            panelClass: ["error-snackbar"],
          }
        );
      },
    });
  }

  updateProduct(id: number, productData: ProductUpdateRequest): void {
    this.productService.updateProduct(id, productData).subscribe({
      next: (product) => {
        console.log("Product updated:", product);
        this.isLoading = false;
        this.snackBar.open("Product updated successfully!", "Close", {
          duration: 3000,
          panelClass: ["success-snackbar"],
        });
        this.router.navigate(["/admin/products"]);
      },
      error: (err) => {
        console.error("Error updating product:", err);
        this.isLoading = false;
        this.snackBar.open(
          "Error updating product: " + (err.error?.message || err.message),
          "Close",
          {
            duration: 5000,
            panelClass: ["error-snackbar"],
          }
        );
      },
    });
  }

  goBack(): void {
    this.router.navigate(["/admin/products"]);
  }
}
