import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { Category } from "src/shared/models/category.model";
import { CategoryService } from "src/app/core/services/category.service";
import { ConfirmationService } from "../../../services/confirmation.service";
import { ErrorHandlerService } from "../../../services/error-handler.service";
import { TranslateService } from '@ngx-translate/core';
import { extractString } from 'src/shared/models/localization.model';


@Component({
  selector: "app-category-list",
  templateUrl: "./category-list.component.html",
  styleUrls: ["./category-list.component.scss"],
})
export class CategoryListComponent implements OnInit {
  displayedColumns: string[] = ["id", "name", "description", "actions"];
  dataSource = new MatTableDataSource<Category>([]);
  isLoading = false;
  error: string | null = null;
  allCategories: Category[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private categoryService: CategoryService,
    private confirmationService: ConfirmationService,
    private errorHandler: ErrorHandlerService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadCategories(): void {
    this.isLoading = true;
    this.error = null;

    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.allCategories = categories;
        this.dataSource.data = categories;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = "Failed to load categories. Please try again.";
        this.isLoading = false;
        this.errorHandler.showError({
          title: this.translate.instant('ERROR_LOADING'),
          message: this.translate.instant('ERROR_LOADING_CATEGORIES'),
          type: 'error'
        });
      },
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  addCategory(): void {
    this.router.navigate(["/admin/categories/new"]);
  }

  editCategory(category: Category): void {
    this.router.navigate(["/admin/categories/edit", category.id]);
  }

  deleteCategory(category: Category): void {
    const categoryName = extractString(category.name);
    this.confirmationService.confirmDelete(categoryName).subscribe(confirmed => {
      if (confirmed) {
        this.categoryService.deleteCategory(category.id).subscribe({
          next: () => {
            this.errorHandler.showSuccess(this.translate.instant('CATEGORY_DELETED_SUCCESS'));
            this.loadCategories();
          },
          error: (err) => {
            this.errorHandler.showError({
              title: this.translate.instant('ERROR'),
              message: this.translate.instant('ERROR_DELETING_CATEGORY'),
              type: 'error'
            });
          },
        });
      }
    });
  }
}