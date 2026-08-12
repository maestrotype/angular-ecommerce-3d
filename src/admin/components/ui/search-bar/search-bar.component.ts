import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FloatLabelType } from '@angular/material/form-field';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Input() width = '100%';
  @Input() maxWidth = '500px';
  @Input() label = 'Search';
  @Input() placeholder = 'Search...';
  @Input() searchTerm = '';
  @Output() onSearch = new EventEmitter<void>();
  @Output() onClear = new EventEmitter<void>();
  @Output() searchTermChange = new EventEmitter<string>();

  isMobile = false;
  private readonly resizeListener = () => this.checkScreenSize();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    this.checkScreenSize();
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('resize', this.resizeListener);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  get floatLabelMode(): FloatLabelType {
    return 'auto';
  }

  get showFloatingLabel(): boolean {
    return !this.isMobile;
  }

  get inputPlaceholder(): string {
    return this.isMobile ? this.placeholder : '';
  }

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

  private checkScreenSize(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= 768;
    }
  }
}
