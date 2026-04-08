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
import { environment } from '../../../../environments/environment';
import { isLegacyLocalUrl } from '../../../../app/core/utils/url-helper';
import { SettingsService } from "../../../services/settings.service";
import { OnboardingDialogComponent } from "../../../components/shared/onboarding-dialog/onboarding-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { AiGenerationService } from "../../../services/ai-generation.service";
import { finalize } from "rxjs/operators";



import { LocalizedString } from "../../../../shared/models/localized-string.model";
import { getLocalizedString } from "../../../../shared/utils/localization.util";

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
  model3dUrl: string = '';
  model3dPublicId: string | null = null;
  isUploading3d = false;
  dragging3d = false;
  // AI Generation State
  isAiGenerating: boolean = false;
  aiStatusMessage: string = '';
  aiProgress: number = 0;
  recentAiTasks: any[] = [];
  showRecoveryList: boolean = false;
  taskId: string | null = null;

  get model3dUrlIsLegacy(): boolean {
    return false;
  }
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
    private http: HttpClient,
    private settingsService: SettingsService,
    private dialog: MatDialog,
    private aiService: AiGenerationService
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
      name_en: ["", [Validators.required, Validators.minLength(2)]],
      name_ru: [""],
      name_ua: [""],
      category: ["", [Validators.required]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      imageUrl: [""],
      description_en: [""],
      description_ru: [""],
      description_ua: [""],
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
          duration: 3000
        });
      }
    });
  }

  generateAi3dModel(): void {
    if (this.isLoading || this.isAiGenerating) return;

    if (this.imageUrls.length === 0) {
      // No images? Let the user upload one specifically for AI
      const input = document.getElementById('aiSourceImageInput') as HTMLInputElement;
      if (input) input.click();
      return;
    }

    this.startAiProcess(this.imageUrls[0]);
  }

  showRecentAiTasks(): void {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.aiService.getRecentTasks(15).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.recentAiTasks = response.data || [];
        this.showRecoveryList = true;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Failed to fetch recent AI tasks', 'Close', { duration: 3000 });
      }
    });
  }

  recoverAiTask(task: any): void {
    if (task.status !== 'success' || !task.result?.model) {
      this.snackBar.open('This task is not finished yet or failed', 'Close', { duration: 3000 });
      return;
    }

    this.showRecoveryList = false;
    this.isAiGenerating = true;
    this.finalizeAiModel(task.result.model, task.task_id);
  }

  onAiSourceImageSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    // Use our existing upload logic but just for the AI source
    this.isAiGenerating = true;
    this.aiStatusMessage = 'Uploading source image...';
    
    // We upload it to get a URL that Tripo3D can access
    this.productService.uploadImage(file).subscribe({
      next: (response: any) => {
        const imageUrl = response.url || response.path;
        this.startAiProcess(imageUrl);
      },
      error: () => {
        this.isAiGenerating = false;
        this.snackBar.open('Failed to upload source image', 'Close', { duration: 3000 });
      }
    });
  }

  private startAiProcess(imageUrl: string): void {
    this.isAiGenerating = true;
    this.isLoading = true; // Still keep main isLoading to block other actions
    this.aiStatusMessage = 'Verifying settings...';

    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        const activeProvider = settings.ai?.activeProvider;
        
        if (!activeProvider) {
          this.isAiGenerating = false;
          this.isLoading = false;
          this.showTripoOnboarding();
        } else {
          this.startAiGeneration(imageUrl);
        }
      },
      error: () => {
        this.isAiGenerating = false;
        this.isLoading = false;
        this.snackBar.open('Failed to verify settings', 'Close', { duration: 3000 });
      }
    });
  }

  private startAiGeneration(imageUrl: string): void {
    this.aiStatusMessage = 'Submitting task to AI...';
    this.aiProgress = 0;
    
    this.aiService.generateModel(imageUrl).subscribe({
      next: (response) => {
        if (response.code === 0 && response.data.task_id) {
          this.pollAiStatus(response.data.task_id);
        } else {
          this.resetAiState();
          this.snackBar.open('AI Error: ' + response.message, 'Close', { duration: 5000 });
        }
      },
      error: (err) => {
        this.resetAiState();
        const msg = err.error?.message || 'Generation failed to start';
        this.snackBar.open(msg, 'Close', { duration: 5000 });
      }
    });
  }

  private pollAiStatus(taskId: string): void {
    this.aiService.pollStatus(taskId).subscribe({
      next: (status) => {
        const data = status.data;
        this.aiProgress = data.progress || 0;
        const apiStatus = data.status || 'unknown';
        
        console.log(`[AI Polling] Task: ${taskId}, Status: ${apiStatus}, Progress: ${this.aiProgress}%`);

        if (apiStatus === 'success' && data.result?.model) {
          this.aiStatusMessage = 'Generation successful! Finalizing model...';
          this.finalizeAiModel(data.result.model, taskId);
        } else if (apiStatus === 'failed') {
          this.resetAiState();
          const errorMsg = status.message || 'Unknown AI error';
          this.snackBar.open('AI Generation failed: ' + errorMsg, 'Close', { duration: 7000 });
        } else {
          // Show the actual API status like "running", "queued", etc.
          const statusText = apiStatus.charAt(0).toUpperCase() + apiStatus.slice(1);
          this.aiStatusMessage = `${statusText}: ${this.aiProgress}%...`;
        }
      },
      error: (err) => {
        console.error('[AI Polling] Request failed:', err);
        // Don't reset immediately, maybe it's a temporary network glitch
        // But if it's a 504/500, we should notify
        const msg = err.error?.message || 'Server connection issue during polling';
        this.aiStatusMessage = `Connection issue: retrying... (${msg})`;
      }
    });
  }

  private resetAiState(): void {
    this.isAiGenerating = false;
    this.isLoading = false;
    this.aiStatusMessage = '';
    this.aiProgress = 0;
  }

  private finalizeAiModel(modelUrl: string, taskId: string): void {
    const filename = `ai-gen-${taskId}.glb`;
    this.aiStatusMessage = 'Downloading model to your server...';
    
    this.aiService.downloadModel(modelUrl, filename).subscribe({
      next: (response) => {
        this.resetAiState();
        if (response.path) {
          this.model3dUrl = response.path;
          this.snackBar.open('3D Model ready and saved!', 'Success', { duration: 5000 });
        }
      },
      error: (err) => {
        this.resetAiState();
        this.snackBar.open('Failed to download model from AI service', 'Close', { duration: 5000 });
      }
    });
  }

  private showTripoOnboarding(): void {
    const dialogRef = this.dialog.open(OnboardingDialogComponent, {
      width: '500px',
      data: {
        title: 'TRIPO3D_DESC',
        message: 'TRIPO3D_INFO_TEXT',
        actionLabel: 'REGISTER_ON_TRIPO3D',
        externalLink: 'https://www.tripo3d.ai/',
        icon: 'auto_awesome'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'setup') {
        this.router.navigate(['/admin/integrations']);
      }
    });
  }


  getCategoryValue(category: Category): string {
    const name = typeof category.name === 'string'
      ? category.name
      : (category.name as LocalizedString).en || '';
    return category.slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
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
    if (!file) return;
    if (!file.name.endsWith('.glb')) {
      this.snackBar.open('Only GLB format is supported. Please convert your model first.', 'Close', { duration: 5000 });
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      this.snackBar.open(`File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB (max 100 MB)`, 'Close', { duration: 5000 });
      return;
    }
    this.isUploading3d = true;
    this.productService.upload3dModel(file).subscribe({
      next: (res) => {
        this.model3dUrl = res.url;
        this.model3dPublicId = res.publicId || null;
        this.isUploading3d = false;
        this.snackBar.open('3D model uploaded to Cloudinary ✓', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.isUploading3d = false;
        const status = err?.status ? ` [HTTP ${err.status}]` : '';
        const serverMsg = err?.error?.message || err?.message || 'Unknown error';
        this.snackBar.open(`3D upload failed${status}: ${serverMsg}`, 'Close', {
          duration: 8000,
          panelClass: 'error-snackbar'
        });
      },
    });
  }

  onModelLoaded(): void {
    // No longer showing success notification on auto-load to avoid annoyance
    // Success on manual upload (on3dFileSelected) is kept
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
        const status = err?.status ? ` [HTTP ${err.status}]` : '';
        const serverMsg = err?.error?.message || err?.message || 'Unknown error';
        this.snackBar.open(`Failed to load product${status}: ${serverMsg}`, 'Close', {
          duration: 7000,
          panelClass: 'error-snackbar'
        });
        this.isLoading = false;
      },
    });
  }

  populateForm(product: Product): void {
    this.productForm.patchValue({
      name_en: this.getLocalizedValue(product.name, 'en'),
      name_ru: this.getLocalizedValue(product.name, 'ru'),
      name_ua: this.getLocalizedValue(product.name, 'ua'),
      category: product.category,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      description_en: this.getLocalizedValue(product.description, 'en'),
      description_ru: this.getLocalizedValue(product.description, 'ru'),
      description_ua: this.getLocalizedValue(product.description, 'ua'),
    });

    if (product.images && product.images.length > 0) {
      this.imageUrls = [...product.images];
    } else if (product.imageUrl) {
      this.imageUrls = [product.imageUrl];
    } else {
      this.imageUrls = [];
    }

    this.model3dUrl = product.model3dUrl || null;
    this.model3dPublicId = (product as any).model3dPublicId || null;

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
    const rawFormValue = this.productForm.value;
    const formValue = this.packLocalizedFields(rawFormValue);

    const specifications: { [key: string]: string } = {};
    rawFormValue.specifications.forEach((spec: any) => {
      // specifications handling remains same but using rawFormValue
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
      model3dPublicId: this.model3dPublicId,
    };
    // rest of onSubmit ... navigations etc
    if (this.isEditMode) {
      this.productService.updateProduct(this.productId!, productData).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Product updated successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/products']);
        },
        error: (err) => {
          this.isLoading = false;
          const status = err?.status ? ` [HTTP ${err.status}]` : '';
          const serverMsg = err?.error?.message || err?.message || 'Unknown error';
          this.snackBar.open(`Error updating product${status}: ${serverMsg}`, 'Close', {
            duration: 7000,
            panelClass: 'error-snackbar'
          });
        }
      });
    } else {
      this.productService.createProduct(productData as any).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Product created successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/admin/products']);
        },
        error: (err) => {
          this.isLoading = false;
          const status = err?.status ? ` [HTTP ${err.status}]` : '';
          const serverMsg = err?.error?.message || err?.message || 'Unknown error';
          this.snackBar.open(`Error creating product${status}: ${serverMsg}`, 'Close', {
            duration: 7000,
            panelClass: 'error-snackbar'
          });
        }
      });
    }
  }

  getLocalizedValue(value: any, lang: string): string {
    if (!value) return '';
    if (typeof value === 'string') return lang === 'en' ? value : '';
    return value[lang] || '';
  }

  private packLocalizedFields(formValue: any): any {
    const data = { ...formValue };

    data.name = {
      en: formValue.name_en,
      ru: formValue.name_ru,
      ua: formValue.name_ua
    };

    data.description = {
      en: formValue.description_en,
      ru: formValue.description_ru,
      ua: formValue.description_ua
    };

    // Cleanup temporary fields
    delete data.name_en; delete data.name_ru; delete data.name_ua;
    delete data.description_en; delete data.description_ru; delete data.description_ua;

    return data;
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

  // legacy methods kept for compatibility if called otherwise
  createProduct(productData: ProductCreateRequest): void {
    // ... same as before
    this.productService.createProduct(productData).subscribe({
      next: (product) => {
        this.isLoading = false;
        this.snackBar.open("Product created successfully!", "Close", { duration: 3000 });
        this.router.navigate(["/admin/products"]);
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open("Error creating product", "Close", { duration: 5000 });
      },
    });
  }

  updateProduct(id: number, productData: ProductUpdateRequest): void {
    this.productService.updateProduct(id, productData).subscribe({
      next: (product) => {
        this.isLoading = false;
        this.snackBar.open("Product updated successfully!", "Close", { duration: 3000 });
        this.router.navigate(["/admin/products"]);
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open("Error updating product", "Close", { duration: 5000 });
      },
    });
  }

  goBack(): void {
    this.router.navigate(["/admin/products"]);
  }
}
