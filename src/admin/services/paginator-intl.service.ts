import { Injectable, OnDestroy } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

@Injectable()
export class PaginatorIntlService extends MatPaginatorIntl implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private translate: TranslateService) {
    super();

    this.translate.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getTranslations();
      });

    this.getTranslations();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getTranslations() {
    this.itemsPerPageLabel = this.translate.instant('ITEMS_PER_PAGE');
    this.nextPageLabel = this.translate.instant('NEXT_PAGE');
    this.previousPageLabel = this.translate.instant('PREVIOUS_PAGE');
    this.firstPageLabel = this.translate.instant('FIRST_PAGE');
    this.lastPageLabel = this.translate.instant('LAST_PAGE');
    this.changes.next();
  }

  override getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return `0 ${this.translate.instant('OF')} ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return `${startIndex + 1} – ${endIndex} ${this.translate.instant('OF')} ${length}`;
  };
}
