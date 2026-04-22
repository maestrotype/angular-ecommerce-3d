import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageUploadComponent),
      multi: true
    }
  ]
})
export class ImageUploadComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() accept: string = 'image/svg+xml,image/png,image/jpeg,image/jpg';
  @Input() maxSize: number = 5 * 1024 * 1024; // 5MB
  @Input() disabled: boolean = false;
  @Output() fileSelected = new EventEmitter<File>();
  @Output() fileUploaded = new EventEmitter<string>();

  imageFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  uploading = false;
  value: string = '';

  private onChange = (value: string) => {};
  private onTouched = () => {};

  constructor(
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  writeValue(value: string): void {
    this.value = value;
    this.imagePreview = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onFileSelected(event: Event): void {
    if (this.disabled) return;

    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.validateAndProcessFile(file);
    }
  }

  onDrop(event: DragEvent): void {
    if (this.disabled) return;

    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.validateAndProcessFile(files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  private validateAndProcessFile(file: File): void {
    const validTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];
    
    if (!validTypes.includes(file.type)) {
      this.snackBar.open(this.translate.instant('INVALID_IMAGE_FORMAT'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      return;
    }

    if (file.size > this.maxSize) {
      const sizeMB = this.maxSize / 1024 / 1024;
      this.snackBar.open(this.translate.instant('FILE_SIZE_LIMIT', { size: sizeMB }), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
      return;
    }

    this.imageFile = file;
    this.fileSelected.emit(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagePreview = reader.result;
      this.onChange('');
      this.onTouched();
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imageFile = null;
    this.imagePreview = null;
    this.value = '';
    this.onChange('');
    this.onTouched();
  }

  onUploadSuccess(url: string): void {
    this.value = url;
    this.imagePreview = url;
    this.onChange(url);
    this.onTouched();
    this.fileUploaded.emit(url);
    this.uploading = false;
  }

  onUploadError(): void {
    this.uploading = false;
  }

  setUploading(loading: boolean): void {
    this.uploading = loading;
  }
} 