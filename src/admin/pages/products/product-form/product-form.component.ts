import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormArray } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import {
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
} from "../../../models/product.model";
import { ProductService } from "../../../services/product.service";
import { CategoryService } from "../../../services/category.service";
import { Category } from "../../../models/category.model";
import { ProcessingOptions, ProcessedImageResult } from "../../../components/ui/image-processor/image-processor.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from 'src/environments/environment';
import { extractString } from 'src/shared/models/localization.model';

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
  model3dFile: File | null = null;
  model3dUrl: string | null = null;
  isUploading3d = false;
  dragging3d = false;
  categories: Category[] = [];

  imageProcessingOptions: ProcessingOptions = {
    removeBackground: true,
    optimize: true
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {
    this.productForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCategories();
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

  private loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {

        this.snackBar.open('Failed to load categories list', "Close", {
          duration: 5000,
        });
      }
    });
  }

  getCategoryValue(category: Category): string {
    return category.slug || category.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFiles(files);
    }
  }

  private handleFiles(files: FileList): void {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file =>
      file.type.startsWith('image/') &&
      ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)
    );

    if (imageFiles.length === 0) {
      this.snackBar.open('Please select only JPG or PNG images', "Close", {
        duration: 3000,
      });
      return;
    }

    this.uploadImages(imageFiles);
  }

  private uploadImages(files: File[]): void {
    this.isUploading = true;

    files.forEach(file => {
      if (this.imageProcessingOptions.removeBackground || this.imageProcessingOptions.optimize) {
        this.processAndUploadImage(file);
      } else {
        this.uploadImageDirectly(file);
      }
    });
  }

  private processAndUploadImage(file: File): void {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('removeBackground', this.imageProcessingOptions.removeBackground.toString());
    formData.append('optimize', this.imageProcessingOptions.optimize.toString());

    this.http.post<{ url: string; processed: boolean; format: string; size: number }>(`${environment.apiUrl}/uploads/process-image`, formData)
      .subscribe({
        next: (response) => {
          this.imageUrls.push(response.url);
          this.isUploading = false;

          if (response.processed) {
            const processingDetails = [];
            if (this.imageProcessingOptions.removeBackground) {
              processingDetails.push('background removed');
            }
            if (this.imageProcessingOptions.optimize) {
              processingDetails.push('optimized');
            }

            this.snackBar.open(`Image ${processingDetails.join(' and ')} successfully!`, "Close", {
              duration: 3000,
            });
          } else {
            this.snackBar.open('Image uploaded successfully!', "Close", {
              duration: 3000,
            });
          }
        },
        error: (error) => {

          this.isUploading = false;

          let errorMessage = 'Failed to process image';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          this.snackBar.open(errorMessage, "Close", {
            duration: 5000,
          });

          // Fallback to direct upload
          this.snackBar.open('Uploading original file without processing...', "Close", {
            duration: 3000,
          });
          this.uploadImageDirectly(file);
        }
      });
  }

  private uploadImageDirectly(file: File): void {
    const formData = new FormData();
    formData.append('image', file);

    this.http.post<{ url: string }>(`${environment.apiUrl}/uploads`, formData)
      .subscribe({
        next: (response) => {
          this.imageUrls.push(response.url);
          this.isUploading = false;
        },
        error: (error) => {

          this.isUploading = false;
          this.snackBar.open('Failed to upload image', "Close", {
            duration: 5000,
          });
        }
      });
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

    const imageFiles = Array.from(files).filter(file =>
      file.type.match(/image\/(png|jpg|jpeg)/) &&
      file.size <= 5 * 1024 * 1024
    );

    if (imageFiles.length === 0) {
      this.snackBar.open('Please select only JPG or PNG images under 5MB', "Close", {
        duration: 3000,
      });
      return;
    }

    this.uploadImages(imageFiles);
  }

  removeImageAt(index: number): void {
    this.imageUrls.splice(index, 1);
  }

  on3dFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file || !file.name.endsWith(".glb")) return;
    this.isUploading3d = true;
    this.productService.upload3dModel(file).subscribe({
      next: (res) => {
        this.model3dUrl = res.url;
        this.isUploading3d = false;
      },
      error: () => {
        this.isUploading3d = false;
      },
    });
  }

  on3dDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragging3d = true;
  }
  on3dDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragging3d = false;
  }
  on3dDrop(event: DragEvent) {
    event.preventDefault();
    this.dragging3d = false;
    if (event.dataTransfer?.files?.length) {
      this.on3dFileSelected({ target: { files: event.dataTransfer.files } });
    }
  }
  remove3dModel() {
    this.model3dUrl = null;
    this.model3dFile = null;
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

        this.snackBar.open('Failed to load product data', "Close", {
          duration: 5000,
        });
        this.isLoading = false;
      },
    });
  }

  populateForm(product: Product): void {
    this.productForm.patchValue({
      name: extractString(product.name),
      category: product.category,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      description: extractString(product.description),
    });

    if (product.images && product.images.length > 0) {
      this.imageUrls = [...product.images];
    } else if (product.imageUrl) {
      this.imageUrls = [product.imageUrl];
    } else {
      this.imageUrls = [];
    }

    this.model3dUrl = product.model3dUrl || null;

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
      this.snackBar.open("Please fill in all required fields correctly", "Close", {
        duration: 3000,
      });
      return;
    }

    if (!this.imageUrls.length) {
      this.snackBar.open("Please upload at least one image before submitting", "Close", {
        duration: 3000,
      });
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
      model3dUrl: this.model3dUrl,
    };

    if (this.isEditMode) {
      this.productService.updateProduct(this.productId!, productData).subscribe({
        next: (product) => {
          this.isLoading = false;
          this.snackBar.open('Product updated successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/products']);
        },
        error: (error) => {
          this.isLoading = false;

          this.snackBar.open('Error updating product', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: (product) => {
          this.isLoading = false;
          this.snackBar.open('Product created successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/products']);
        },
        error: (error) => {
          this.isLoading = false;

          this.snackBar.open('Error creating product', 'Close', { duration: 3000 });
        }
      });
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

        this.isLoading = false;
        this.snackBar.open("Product created successfully!", "Close", {
          duration: 3000,
        });
        this.router.navigate(["/admin/products"]);
      },
      error: (err) => {

        this.isLoading = false;
        this.snackBar.open("Error creating product", "Close", {
          duration: 5000,
        });
      },
    });
  }

  updateProduct(id: number, productData: ProductUpdateRequest): void {
    this.productService.updateProduct(id, productData).subscribe({
      next: (product) => {

        this.isLoading = false;
        this.snackBar.open("Product updated successfully!", "Close", {
          duration: 3000,
        });
        this.router.navigate(["/admin/products"]);
      },
      error: (err) => {

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
