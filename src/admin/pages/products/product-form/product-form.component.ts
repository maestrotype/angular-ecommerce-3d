import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormArray } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Product, ProductCreateRequest, ProductUpdateRequest } from "../../../models/product.model";
import { ProductService } from "../../../services/product.service";

@Component({
  selector: "app-product-form",
  templateUrl: "product-form.component.html",
  styleUrl: "product-form.component.scss",
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
      name: ["", [Validators.required]],
      category: ["", [Validators.required]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      imageUrl: [""],
      description: ["", [Validators.required]],
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

  loadProduct(id: number): void {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.populateForm(product);
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error loading product:", err);
        this.snackBar.open("Error loading product", "Close", {
          duration: 5000,
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
        specifications,
      };

      if (this.isEditMode && this.productId) {
        this.updateProduct(this.productId, productData);
      } else {
        this.createProduct(productData);
      }
    }
  }

  createProduct(productData: ProductCreateRequest): void {
    this.productService.createProduct(productData).subscribe({
      next: (product) => {
        console.log("Product created:", product);
        this.isLoading = false;
        this.snackBar.open("Product created successfully!", "Close", {
          duration: 3000,
        });
        this.router.navigate(["/admin/products"]);
      },
      error: (err) => {
        console.error("Error creating product:", err);
        this.isLoading = false;
        this.snackBar.open("Error creating product", "Close", {
          duration: 5000,
        });
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
        });
        this.router.navigate(["/admin/products"]);
      },
      error: (err) => {
        console.error("Error updating product:", err);
        this.isLoading = false;
        this.snackBar.open("Error updating product", "Close", {
          duration: 5000,
        });
      },
    });
  }

  goBack(): void {
    this.router.navigate(["/admin/products"]);
  }
}
