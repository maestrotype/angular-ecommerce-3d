import { Component, OnInit, HostListener } from "@angular/core";
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
import { getLocalizedString, translateErrorMessage } from "../../../../shared/utils/localization.util";
import { TranslateService } from "@ngx-translate/core";

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

  get model3dUrlIsLocal(): boolean {
    return !!this.model3dUrl && (this.model3dUrl.includes('localhost') || this.model3dUrl.includes('127.0.0.1') || !!this.model3dPublicId?.startsWith('LOCAL:'));
  }

  get model3dUrlIsBlockedByMixedContent(): boolean {
    // If we are on HTTPS but the model is HTTP Localhost
    return window.location.protocol === 'https:' && this.model3dUrlIsLocal && !!this.model3dUrl?.startsWith('http:');
  }

  get model3dUrlIsLegacy(): boolean {
    return this.model3dUrlIsLocal;
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
    private aiService: AiGenerationService,
    private translate: TranslateService
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
    this.fetchActiveEngineName();
  }

  private fetchActiveEngineName(): void {
    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        const providerId = settings.ai?.activeProvider || 'tripo3d';
        const key = providerId.toUpperCase();
        // Map provider ID to translation key
        const providerMap: any = {
          'tripo3d': 'Tripo3D (High Quality Paid)',
          'hunyuan3d': 'HUNYUAN_TENCENT',
          'meshy': 'MESHY_AI',
          'luma': 'LUMA_AI',
          'unique3d': 'UNIQUE3D_LOCAL_HQ',
          'hunyuan_v2': 'HUNYUAN_V2_CLOUD_FREE',
          'custom': 'CUSTOM_WEBHOOK_LOCAL'
        };
        
        const label = providerMap[providerId] || providerId;
        this.translate.get(label).subscribe(translated => {
          this.aiStatusMessage = translated;
        });
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
        this.snackBar.open(this.translate.instant('FAILED_TO_LOAD_CATEGORIES'), this.translate.instant('CLOSE_BTN'), {
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
        this.snackBar.open(this.translate.instant('FAILED_TO_FETCH_AI_TASKS'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      }
    });
  }

  recoverAiTask(task: any): void {
    if (task.status !== 'success' || !task.result?.model) {
      this.snackBar.open(this.translate.instant('AI_TASK_NOT_FINISHED'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
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
    this.aiStatusMessage = this.translate.instant('AI_UPLOADING_SOURCE');
    
    // We upload it to get a URL that Tripo3D can access
    this.productService.uploadImage(file).subscribe({
      next: (response: any) => {
        const imageUrl = response.url || response.path;
        this.startAiProcess(imageUrl);
      },
      error: () => {
        this.isAiGenerating = false;
        this.snackBar.open(this.translate.instant('FAILED_TO_UPLOAD_SOURCE_IMAGE'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      }
    });
  }

  private startAiProcess(imageUrl: string): void {
    this.isAiGenerating = true;
    this.isLoading = true; // Still keep main isLoading to block other actions
    this.aiStatusMessage = this.translate.instant('AI_VERIFYING_SETTINGS');

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
        this.snackBar.open(this.translate.instant('FAILED_TO_VERIFY_SETTINGS'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      }
    });
  }

  private startAiGeneration(imageUrl: string): void {
    this.aiStatusMessage = this.translate.instant('AI_SUBMITTING_TASK');
    this.aiProgress = 0;
    
    this.aiService.generateModel(imageUrl).subscribe({
      next: (response) => {
        if (response.code === 0 && response.data.task_id) {
          this.pollAiStatus(response.data.task_id);
        } else {
          this.resetAiState();
          const errorMsg = translateErrorMessage(response.message, this.translate);
          this.snackBar.open(this.translate.instant('AI_ERROR_PREFIX') + errorMsg, this.translate.instant('CLOSE_BTN'), { duration: 5000 });
        }
      },
      error: (err) => {
        this.resetAiState();
        const rawMsg = err.error?.message || 'Generation failed to start';
        const msg = translateErrorMessage(rawMsg, this.translate);
        this.snackBar.open(msg, this.translate.instant('CLOSE_BTN'), { duration: 5000 });
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
          this.aiStatusMessage = this.translate.instant('AI_GENERATION_SUCCESS');
          
          const modelUrl = data.result.model;
          const isLocalModel = modelUrl.includes('localhost') || modelUrl.includes('127.0.0.1');

          if (isLocalModel) {
            // Local models are served directly from the worker
            this.model3dUrl = modelUrl;
            // PublicId for local files can be stored to allow archiving
            this.model3dPublicId = (data as any).localPath ? 'LOCAL:' + (data as any).localPath : null;
            this.resetAiState();
            this.snackBar.open('Model generated and loaded locally!', this.translate.instant('CLOSE_BTN'), { duration: 3000 });
          } else {
            this.finalizeAiModel(modelUrl, taskId);
          }
        } else if (apiStatus === 'failed') {
          this.resetAiState();
          const errorMsg = translateErrorMessage((status as any).data?.error || status.message || 'Unknown AI error', this.translate);
          this.snackBar.open(this.translate.instant('AI_GENERATION_FAILED_PREFIX') + errorMsg, this.translate.instant('CLOSE_BTN'), { duration: 7000 });
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
    this.aiProgress = 0;
    this.fetchActiveEngineName(); // Restore engine name after generation
  }

  private finalizeAiModel(modelUrl: string, taskId: string): void {
    const filename = `ai-gen-${taskId}.glb`;
    this.aiStatusMessage = this.translate.instant('AI_DOWNLOADING_MODEL');
    
    this.aiService.downloadModel(modelUrl, filename).subscribe({
      next: (response: any) => {
        this.resetAiState();
        if (response.path) {
          this.model3dUrl = response.path;
          this.model3dPublicId = response.publicId || null;
          this.snackBar.open(this.translate.instant('MODEL_3D_READY_SAVED'), this.translate.instant('SUCCESS_BTN'), { duration: 5000 });
        }
      },
      error: (err) => {
        this.resetAiState();
        const errorMsg = translateErrorMessage(err.error?.message || 'FAILED_TO_DOWNLOAD_AI_MODEL', this.translate);
        this.snackBar.open(errorMsg, this.translate.instant('CLOSE_BTN'), { duration: 5000 });
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

  @HostListener('window:paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const files = event.clipboardData?.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        event.preventDefault(); // Prevent default browser paste behavior for images
        this.uploadImages(imageFiles);
      }
    }
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
      this.snackBar.open(this.translate.instant('ONLY_JPG_PNG'), this.translate.instant('CLOSE_BTN'), {
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
            this.snackBar.open(this.translate.instant('IMAGE_UPLOADED_SUCCESSFULLY'), this.translate.instant('CLOSE_BTN'), {
              duration: 3000,
            });
          }
        },
        error: (error) => {

          this.isUploading = false;

          let errorMessage = 'Failed to process image';
          if (error.error?.message) {
            errorMessage = translateErrorMessage(error.error.message, this.translate);
          } else if (error.message) {
            errorMessage = error.message;
          }

          this.snackBar.open(errorMessage, "Close", {
            duration: 5000,
          });

          // Fallback to direct upload
          this.snackBar.open(this.translate.instant('UPLOADING_ORIGINAL'), this.translate.instant('CLOSE_BTN'), {
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
          this.snackBar.open(this.translate.instant('FAILED_TO_UPLOAD_IMAGE'), this.translate.instant('CLOSE_BTN'), {
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
      this.snackBar.open(this.translate.instant('ONLY_JPG_PNG_5MB'), this.translate.instant('CLOSE_BTN'), {
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
      this.snackBar.open(this.translate.instant('ONLY_GLB_FORMAT'), this.translate.instant('CLOSE_BTN'), { duration: 5000 });
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      this.snackBar.open(this.translate.instant('FILE_TOO_LARGE'), this.translate.instant('CLOSE_BTN'), { duration: 5000 });
      return;
    }
    this.isUploading3d = true;
    this.productService.upload3dModel(file).subscribe({
      next: (res) => {
        this.model3dUrl = res.url;
        this.model3dPublicId = res.publicId || null;
        this.isUploading3d = false;
        this.snackBar.open(this.translate.instant('MODEL_3D_UPLOADED'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      },
      error: (err) => {
        this.isUploading3d = false;
        const status = err?.status ? ` [HTTP ${err.status}]` : '';
        const rawMsg = err?.error?.message || err?.message || 'Unknown error';
        const errorMsg = translateErrorMessage(rawMsg, this.translate);
        this.snackBar.open(this.translate.instant('MODEL_3D_UPLOAD_FAILED') + status + ': ' + errorMsg, this.translate.instant('CLOSE_BTN'), {
          duration: 8000,
          panelClass: 'error-snackbar'
        });
      },
    });
  }

  archiveLocalModel(): void {
    if (!this.model3dUrl || !this.model3dUrlIsLocal) return;
    
    // If it's a localhost URL from the worker, we use downloadModel to archive it
    if (this.model3dUrl.includes('localhost:8000') || this.model3dUrl.includes('127.0.0.1:8000')) {
      const taskId = this.model3dUrl.split('/').pop()?.replace('.glb', '') || 'unknown';
      this.finalizeAiModel(this.model3dUrl, taskId);
      return;
    }

    // Otherwise, if it has a LOCAL: path, use archive service
    if (this.model3dPublicId?.startsWith('LOCAL:')) {
      const localPath = this.model3dPublicId;
      this.isUploading3d = true;
      
      this.productService.archiveLocalModel(localPath).subscribe({
        next: (res) => {
          this.model3dUrl = res.url;
          this.model3dPublicId = res.publicId;
          this.isUploading3d = false;
          this.snackBar.open(this.translate.instant('MODEL_ARCHIVED_SUCCESSFULLY'), this.translate.instant('SUCCESS_BTN'), { duration: 5000 });
        },
        error: (err) => {
          this.isUploading3d = false;
          this.snackBar.open(this.translate.instant('ARCHIVE_FAILED'), this.translate.instant('CLOSE_BTN'), { duration: 5000 });
          console.error('Archive error:', err);
        }
      });
    }
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
        const rawMsg = err?.error?.message || err?.message || 'Unknown error';
        const errorMsg = translateErrorMessage(rawMsg, this.translate);
        this.snackBar.open(this.translate.instant('FAILED_TO_LOAD_PRODUCT') + status + ': ' + errorMsg, this.translate.instant('CLOSE_BTN'), {
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
      this.snackBar.open(this.translate.instant('FILL_REQUIRED_FIELDS'), this.translate.instant('CLOSE_BTN'), {
        duration: 3000,
      });
      return;
    }

    if (!this.imageUrls.length) {
      this.snackBar.open(this.translate.instant('UPLOAD_IMAGE_BEFORE_SUBMIT'), this.translate.instant('CLOSE_BTN'), {
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
          this.snackBar.open(this.translate.instant('PRODUCT_UPDATED_SUCCESSFULLY'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
          this.router.navigate(['/admin/products']);
        },
        error: (err) => {
          this.isLoading = false;
          const status = err?.status ? ` [HTTP ${err.status}]` : '';
          const rawMsg = err?.error?.message || err?.message || 'Unknown error';
          const errorMsg = translateErrorMessage(rawMsg, this.translate);
          this.snackBar.open(this.translate.instant('ERROR_UPDATING_PRODUCT') + status + ': ' + errorMsg, this.translate.instant('CLOSE_BTN'), {
            duration: 7000,
            panelClass: 'error-snackbar'
          });
        }
      });
    } else {
      this.productService.createProduct(productData as any).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open(this.translate.instant('PRODUCT_CREATED_SUCCESSFULLY'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
          this.router.navigate(['/admin/products']);
        },
        error: (err) => {
          this.isLoading = false;
          const status = err?.status ? ` [HTTP ${err.status}]` : '';
          const rawMsg = err?.error?.message || err?.message || 'Unknown error';
          const errorMsg = translateErrorMessage(rawMsg, this.translate);
          this.snackBar.open(this.translate.instant('ERROR_CREATING_PRODUCT') + status + ': ' + errorMsg, this.translate.instant('CLOSE_BTN'), {
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
        this.snackBar.open(this.translate.instant('PRODUCT_CREATED_SUCCESSFULLY'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
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
        this.snackBar.open(this.translate.instant('PRODUCT_UPDATED_SUCCESSFULLY'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
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
