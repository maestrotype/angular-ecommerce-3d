import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatChipListboxChange } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { switchMap } from 'rxjs/operators';
import { Category } from '../../../../models/category.model';
import { Product, ProductUpdateRequest } from 'src/shared/models/product.model';
import { ProductService } from 'src/app/core/services/product.service';
import { AdminProductService } from '../../../../services/product.service';
import {
  DEFAULT_STAGE_CATEGORIES,
  DEFAULT_STAGE_LIMIT,
  expandStageCategories,
  pickStageProducts,
  productHas3dModel,
  stageModelPath,
} from 'src/shared/utils/product-stage.util';
import { filterProductsByCategorySlugs } from 'src/shared/utils/shop-catalog.util';
import { getLocalizedString, resolveApiError, formatResolvedApiError } from 'src/shared/utils/localization.util';
import { GLB_OPTIMIZE_HINT_BYTES, RAW_GLB_UPLOAD_MAX_BYTES } from '../../../../constants/glb-upload.constants';

@Component({
  selector: 'app-section-product-stage-form',
  templateUrl: './product-stage-form.component.html',
  styleUrls: ['../section-form.component.scss', './product-stage-form.component.scss'],
})
export class SectionProductStageFormComponent implements OnInit {
  @Input({ required: true }) sectionForm!: FormGroup;
  @Input() activeMenuLang = 'en';
  @Input() productFilterCategories: Category[] = [];

  stageProducts: Product[] = [];
  uploadingProductId: number | null = null;
  pinQuery = '';

  constructor(
    private productService: ProductService,
    private adminProductService: AdminProductService,
    private translate: TranslateService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.stageProducts = products.filter(productHas3dModel);
      },
    });
  }

  get liveStageProducts(): Product[] {
    return pickStageProducts(this.stageProducts, {
      productIds: this.sectionForm.get('stageProductIds')?.value,
      categories: this.sectionForm.get('stageCategories')?.value,
      limit: this.sectionForm.get('stageLimit')?.value ?? DEFAULT_STAGE_LIMIT,
    });
  }

  get pinnableProducts(): Product[] {
    const selected = this.sectionForm.get('stageCategories')?.value as string[] | undefined;
    const cats = expandStageCategories(
      selected?.length ? selected : DEFAULT_STAGE_CATEGORIES,
    );
    return filterProductsByCategorySlugs(this.stageProducts, cats);
  }

  get filteredPinnableProducts(): Product[] {
    const query = this.pinQuery.trim().toLowerCase();
    const list = this.pinnableProducts;
    if (!query) {
      return list;
    }
    return list.filter((product) => this.productLabel(product).toLowerCase().includes(query));
  }

  onPinQuery(event: Event): void {
    this.pinQuery = (event.target as HTMLInputElement).value;
  }

  isPinned(id: number): boolean {
    const ids = (this.sectionForm.get('stageProductIds')?.value as Array<number | string> | null) || [];
    return ids.some((value) => Number(value) === id);
  }

  togglePinned(id: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const control = this.sectionForm.get('stageProductIds');
    const current = ((control?.value as Array<number | string> | null) || [])
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0);
    const next = checked
      ? (current.includes(id) ? current : [...current, id])
      : current.filter((value) => value !== id);
    control?.setValue(next);
    control?.markAsDirty();
    control?.markAsTouched();
  }

  productLabel(product: Product): string {
    return getLocalizedString(product.name, this.translate.currentLang) || `#${product.id}`;
  }

  trackByProductId(_index: number, product: Product): number {
    return product.id;
  }

  modelFileName(product: Product): string {
    const path = stageModelPath(product);
    if (!path) {
      return this.translate.instant('PRODUCT_STAGE_NO_MODEL');
    }
    const raw = path.split('/').pop()?.split('?')[0] || path;
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }

  getProductCategorySlug(category: Category): string {
    const name =
      typeof category.name === 'string' ? category.name : category.name?.en || '';
    return (
      category.slug ||
      name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    );
  }

  onStageCategoriesChange(event: MatChipListboxChange): void {
    const value = Array.isArray(event.value)
      ? event.value
      : event.value
        ? [event.value]
        : [];
    this.sectionForm.get('stageCategories')?.setValue(value);
  }

  onChangeModel(product: Product, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    if (!file.name.toLowerCase().endsWith('.glb')) {
      this.snackBar.open(
        this.translate.instant('SELECT_VALID_GLB'),
        this.translate.instant('CLOSE_BTN'),
        { duration: 3000 },
      );
      return;
    }
    if (file.size > RAW_GLB_UPLOAD_MAX_BYTES) {
      this.snackBar.open(
        this.translate.instant('MODEL_3D_SIZE_LIMIT'),
        this.translate.instant('CLOSE_BTN'),
        { duration: 4000 },
      );
      return;
    }

    if (file.size > GLB_OPTIMIZE_HINT_BYTES) {
      this.snackBar.open(
        this.translate.instant('MODEL_3D_OPTIMIZING'),
        this.translate.instant('CLOSE_BTN'),
        { duration: 5000 },
      );
    }

    this.uploadingProductId = product.id;
    this.adminProductService.upload3dModel(file).pipe(
      switchMap((res) => {
        const payload: ProductUpdateRequest = {
          id: product.id,
          model3dUrl: res.url,
          localModel3dUrl: res.localPath || undefined,
          model3dPublicId: res.publicId || undefined,
        };
        return this.adminProductService.updateProduct(product.id, payload);
      }),
    ).subscribe({
      next: (updated) => {
        this.stageProducts = this.stageProducts.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item,
        );
        this.uploadingProductId = null;
        this.adminProductService.notifyCatalogChanged();
        this.snackBar.open(
          this.translate.instant('PRODUCT_STAGE_MODEL_UPDATED'),
          this.translate.instant('CLOSE_BTN'),
          { duration: 3000 },
        );
      },
      error: (error) => {
        this.uploadingProductId = null;
        const resolved = resolveApiError(error, this.translate, {
          titleKey: 'ERROR_UPLOADING_3D_MODEL',
        });
        this.snackBar.open(
          formatResolvedApiError(resolved),
          this.translate.instant('CLOSE_BTN'),
          { duration: resolved.duration, panelClass: resolved.panelClass },
        );
      },
    });
  }
}
