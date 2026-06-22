import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Page } from 'src/shared/models/page.model';
import { PageService } from '../../../services/page.service';
import { ConfirmationService } from '../../../services/confirmation.service';
import { getLocalizedString } from 'src/shared/utils/localization.util';

@Component({
  selector: 'app-page-list',
  templateUrl: './page-list.component.html',
  styleUrls: ['./page-list.component.scss'],
})
export class PageListComponent implements OnInit, AfterViewInit {
  displayedColumns = ['slug', 'title', 'template', 'status', 'actions'];
  dataSource = new MatTableDataSource<Page>([]);
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private pageService: PageService,
    private router: Router,
    private snackBar: MatSnackBar,
    private confirmationService: ConfirmationService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.loadPages();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadPages(): void {
    this.isLoading = true;
    this.pageService.getPagesForAdmin().subscribe({
      next: (pages) => {
        this.dataSource.data = pages;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open(
          this.translate.instant('PAGES_LOAD_ERROR'),
          this.translate.instant('CLOSE_BTN'),
          { duration: 5000 },
        );
      },
    });
  }

  applyFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

  addPage(): void {
    this.router.navigate(['/admin/pages/new']);
  }

  editPage(page: Page): void {
    this.router.navigate(['/admin/pages/edit', page.id]);
  }

  openSections(page: Page): void {
    this.router.navigate(['/admin/sections'], { queryParams: { pageTarget: page.slug } });
  }

  previewPage(page: Page): void {
    window.open(`/${page.slug}`, '_blank');
  }

  deletePage(page: Page): void {
    const title = getLocalizedString(page.title, this.translate.currentLang || 'en') || page.slug;
    this.confirmationService.confirm({
      title: this.translate.instant('DELETE_PAGE'),
      message: this.translate.instant('DELETE_PAGE_CONFIRM', { title }),
      confirmText: this.translate.instant('DELETE'),
      cancelText: this.translate.instant('CANCEL'),
      type: 'warning',
    }).subscribe(confirmed => {
      if (!confirmed) return;
      this.pageService.deletePage(page.id).subscribe({
        next: () => {
          this.snackBar.open(
            this.translate.instant('PAGE_DELETED'),
            this.translate.instant('CLOSE_BTN'),
            { duration: 3000 },
          );
          this.loadPages();
        },
        error: () => {
          this.snackBar.open(
            this.translate.instant('PAGE_DELETE_ERROR'),
            this.translate.instant('CLOSE_BTN'),
            { duration: 5000 },
          );
        },
      });
    });
  }

  getTemplateLabel(template: string): string {
    const key = `PAGE_TEMPLATE_${template.toUpperCase()}`;
    return this.translate.instant(key);
  }

  getStatusLabel(status: string): string {
    return this.translate.instant(status === 'published' ? 'PAGE_STATUS_PUBLISHED' : 'PAGE_STATUS_DRAFT');
  }
}
