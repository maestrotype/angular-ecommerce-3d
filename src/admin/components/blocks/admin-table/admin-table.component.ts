import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';

export type AdminTableDensity = 'compact' | 'default' | 'comfortable';

@Component({
  selector: 'app-admin-table',
  templateUrl: './admin-table.component.html',
  styleUrls: ['./admin-table.component.scss']
})
export class AdminTableComponent {
  @Input() dataSource: any;
  @Input() displayedColumns: string[] = [];
  @Input() loading = false;
  @Input() pageSizeOptions: number[] = [5, 10, 20];
  @Input() showFirstLastButtons = true;
  @Input() density: AdminTableDensity = 'default';
  @Input() striped = true;
  @Input() skeletonRows = 6;

  @Output() sortChange = new EventEmitter<Sort>();
  @Output() pageChange = new EventEmitter<PageEvent>();

  get containerClasses(): string {
    const classes = ['admin-table-container'];
    if (this.density !== 'default') {
      classes.push(`admin-table--${this.density}`);
    }
    if (!this.striped) {
      classes.push('admin-table--flat');
    }
    return classes.join(' ');
  }
}
