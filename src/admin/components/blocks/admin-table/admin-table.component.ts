import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';

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

  @Output() sortChange = new EventEmitter<Sort>();
  @Output() pageChange = new EventEmitter<PageEvent>();
}




