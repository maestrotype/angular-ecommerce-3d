import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductFormDraft } from './product-form-draft.model';
import { ProductAiCopyResponse } from './product-form-ai-copy.service';

@Component({
  selector: 'app-product-ai-copy-dialog',
  templateUrl: './product-ai-copy-dialog.component.html',
  styleUrls: ['./product-ai-copy-dialog.component.scss'],
})
export class ProductAiCopyDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductAiCopyDialogComponent, ProductFormDraft | null>,
    @Inject(MAT_DIALOG_DATA) public data: ProductAiCopyResponse,
  ) {
    this.form = this.fb.group({
      name_en: [data.name_en || ''],
      name_ru: [data.name_ru || ''],
      name_ua: [data.name_ua || ''],
      description_en: [data.description_en || ''],
      description_ru: [data.description_ru || ''],
      description_ua: [data.description_ua || ''],
    });
  }

  apply(): void {
    this.dialogRef.close(this.form.value as ProductFormDraft);
  }

  discard(): void {
    this.dialogRef.close(null);
  }
}
