import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CategoryService } from "../../../services/category.service";
import { Category } from "../../../models/category.model";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-category-form",
  templateUrl: "./category-form.component.html",
  styleUrls: ["./category-form.component.scss"],
})
export class CategoryFormComponent implements OnInit {
  categoryForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  categoryId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private categoryService: CategoryService,
    private translate: TranslateService
  ) {
    this.categoryForm = this.fb.group({
      name_en: ["", [Validators.required, Validators.minLength(2)]],
      name_ru: [""],
      name_ua: [""],
      description_en: [""],
      description_ru: [""],
      description_ua: [""],
      icon: [""],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params["id"]) {
        this.categoryId = params["id"];
        this.isEditMode = true;
        this.loadCategory(this.categoryId);
      }
    });
  }

  loadCategory(id: string): void {
    this.isLoading = true;
    this.categoryService.getCategoryById(id).subscribe({
      next: (category) => {
        this.categoryForm.patchValue({
          name_en: this.getLocalizedValue(category.name, 'en'),
          name_ru: this.getLocalizedValue(category.name, 'ru'),
          name_ua: this.getLocalizedValue(category.name, 'ua'),
          description_en: this.getLocalizedValue(category.description, 'en'),
          description_ru: this.getLocalizedValue(category.description, 'ru'),
          description_ua: this.getLocalizedValue(category.description, 'ua'),
          icon: category.icon || '',
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open(this.translate.instant('ERROR_LOADING_CATEGORY'), this.translate.instant('CLOSE_BTN'), {
          duration: 5000,
        });
        this.isLoading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.snackBar.open(this.translate.instant('FILL_REQUIRED_FIELDS'), this.translate.instant('CLOSE_BTN'), {
        duration: 3000,
      });
      return;
    }

    this.isLoading = true;
    const formValue = this.categoryForm.value;
    const packedData = {
      name: {
        en: formValue.name_en,
        ru: formValue.name_ru,
        ua: formValue.name_ua
      },
      description: {
        en: formValue.description_en,
        ru: formValue.description_ru,
        ua: formValue.description_ua
      },
      icon: formValue.icon
    };

    if (this.isEditMode && this.categoryId) {
      this.categoryService.updateCategory(this.categoryId, packedData).subscribe({
        next: () => {
          this.snackBar.open(this.translate.instant('CATEGORY_UPDATED_SUCCESSFULLY'), this.translate.instant('CLOSE_BTN'), {
            duration: 3000,
          });
          this.router.navigate(["/admin/categories"]);
        },
        error: (err) => {
          this.snackBar.open(this.translate.instant('ERROR_UPDATING_CATEGORY'), this.translate.instant('CLOSE_BTN'), {
            duration: 5000,
          });
          this.isLoading = false;
        },
      });
    } else {
      this.categoryService.createCategory(packedData).subscribe({
        next: () => {
          this.snackBar.open(this.translate.instant('CATEGORY_CREATED_SUCCESSFULLY'), this.translate.instant('CLOSE_BTN'), {
            duration: 3000,
          });
          this.router.navigate(["/admin/categories"]);
        },
        error: (err) => {
          this.snackBar.open(this.translate.instant('ERROR_CREATING_CATEGORY'), this.translate.instant('CLOSE_BTN'), {
            duration: 5000,
          });
          this.isLoading = false;
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(["/admin/categories"]);
  }

  getLocalizedValue(value: any, lang: string): string {
    if (value && typeof value === 'object' && value[lang]) {
      return value[lang];
    }
    if (typeof value === 'string' && lang === 'en') {
      return value;
    }
    return '';
  }

  onImageProcessed(result: any): void {
  }

  onImageError(error: string): void {
    this.snackBar.open(error, this.translate.instant('CLOSE_BTN'), {
      duration: 5000,
    });
  }
}