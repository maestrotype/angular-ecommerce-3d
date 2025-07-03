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

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
  
    // Validate file type
    if (!file.type.match(/image\/(png|jpg|jpeg)/)) {
      this.snackBar.open("Please select a PNG or JPG image", "Close", {
        duration: 3000,
        panelClass: ["error-snackbar"],
      });
      return;
    }
  
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.snackBar.open("File size must be less than 5MB", "Close", {
        duration: 3000,
        panelClass: ["error-snackbar"],
      });
      return;
    }
  
    this.isUploading = true;
  
    // Preview (optional, не используется как imageUrl!)
    const reader = new FileReader();
    reader.onload = (e) => {
      this.selectedImageUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  
    // Upload
    this.productService.uploadImage(file).subscribe({
      next: (response) => {
        if (response.url && response.url.startsWith("http")) {
          this.productForm.patchValue({
            imageUrl: response.url,
          });
          this.snackBar.open("Image uploaded successfully", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });
        } else {
          this.snackBar.open("Invalid image URL received from server", "Close", {
            duration: 3000,
            panelClass: ["error-snackbar"],
          });
        }
        this.isUploading = false;
      },
      error: (err) => {
        console.error("Error uploading image:", err);
        this.isUploading = false;
        this.snackBar.open("Failed to upload image", "Close", {
          duration: 3000,
          panelClass: ["error-snackbar"],
        });
      },
    });
  }  

  removeImage(): void {
    this.selectedImageUrl = null;
    this.productForm.patchValue({
      imageUrl: "",
    });
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

    if (
      !this.productForm.value.imageUrl ||
      !this.productForm.value.imageUrl.startsWith("http")
    ) {
      this.snackBar.open(
        "Please upload a valid image before submitting",
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

    // Convert specifications array to object
    const specifications: { [key: string]: string } = {};
    formValue.specifications.forEach((spec: any) => {
      if (spec.key && spec.value) {
        specifications[spec.key] = spec.value;
      }
    });

    const productData = {
      ...formValue,
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
    this.productService.updateProduct(id, { ...productData, id }).subscribe({
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
