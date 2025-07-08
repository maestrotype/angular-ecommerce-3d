import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { Category } from "src/shared/models/category.model";
import { CategoryService } from "src/app/core/services/category.service";


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
    private categoryService: CategoryService
  ) {}

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
        this.snackBar.open("Error loading categories", "Close", {
          duration: 5000,
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
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      this.categoryService.deleteCategory(category.id).subscribe({
        next: () => {
          this.snackBar.open("Category deleted successfully", "Close", {
            duration: 3000,
          });
          this.loadCategories();
        },
        error: (err) => {
          this.snackBar.open("Error deleting category", "Close", {
            duration: 5000,
          });
        },
      });
    }
  }
}