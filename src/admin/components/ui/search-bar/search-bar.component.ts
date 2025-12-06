import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent {
  @Input() width = '100%';
  @Input() maxWidth = '500px';
  @Input() label = 'Search';
  @Input() placeholder = 'Search...';
  @Input() searchTerm = '';
  @Output() onSearch = new EventEmitter<void>();
  @Output() onClear = new EventEmitter<void>();
  @Output() searchTermChange = new EventEmitter<string>();

  onSearchClick(): void {
    this.onSearch.emit();
  }

  onClearClick(): void {
    this.searchTerm = '';
    this.searchTermChange.emit(this.searchTerm);
    this.onClear.emit();
  }

  onInputChange(value: string): void {
    this.searchTerm = value;
    this.searchTermChange.emit(this.searchTerm);
  }
}



