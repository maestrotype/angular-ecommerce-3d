
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-data-table',
  templateUrl: 'data-table.component.html',
  styleUrl: 'data-table.component.scss',
})
export class DataTableComponent {
  @Input() data: any[] = [];
}
