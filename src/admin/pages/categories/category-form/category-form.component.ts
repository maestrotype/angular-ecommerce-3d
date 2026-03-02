import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CategoryService } from "../../../services/category.service";
import { Category } from "../../../models/category.model";
import { extractString } from 'src/shared/models/localization.model';

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
    private categoryService: CategoryService
  ) {
    this.categoryForm = this.fb.group({
      name: ["", [Validators.required, Validators.minLength(2)]],
      description: [""],
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
          name: extractString(category.name),
          description: extractString(category.description),
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open("Error loading category", "Close", {
          duration: 5000,
        });
        this.isLoading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.snackBar.open("Please fill in all required fields", "Close", {
        duration: 3000,
      });
      return;
    }

    this.isLoading = true;
    const formValue = this.categoryForm.value;

    if (this.isEditMode && this.categoryId) {
      this.categoryService.updateCategory(this.categoryId, formValue).subscribe({
        next: () => {
          this.snackBar.open("Category updated successfully!", "Close", {
            duration: 3000,
          });
          this.router.navigate(["/admin/categories"]);
        },
        error: (err) => {
          this.snackBar.open("Error updating category", "Close", {
            duration: 5000,
          });
          this.isLoading = false;
        },
      });
    } else {
      this.categoryService.createCategory(formValue).subscribe({
        next: () => {
          this.snackBar.open("Category created successfully!", "Close", {
            duration: 3000,
          });
          this.router.navigate(["/admin/categories"]);
        },
        error: (err) => {
          this.snackBar.open("Error creating category", "Close", {
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
}