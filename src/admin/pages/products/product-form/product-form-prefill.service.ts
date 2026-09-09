import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  PRODUCT_FORM_SCALAR_KEYS,
  ProductFormDraft,
  ProductFormPrefillSnapshot,
  ProductFormScalarKey,
  ProductFormSpecDraft,
} from './product-form-draft.model';

export type ProductFormPrefillMode = 'merge' | 'overwrite';

function specRows(form: FormGroup): ProductFormSpecDraft[] {
  const array = form.get('specifications') as FormArray | null;
  if (!array) {
    return [];
  }
  return array.getRawValue().map((row: ProductFormSpecDraft) => ({
    key: row?.key ?? '',
    value: row?.value ?? '',
  }));
}

export function areSpecificationsEmpty(rows: ProductFormSpecDraft[]): boolean {
  return rows.every((row) => !String(row.key ?? '').trim() && !String(row.value ?? '').trim());
}

export function isProductFormScalarEmpty(key: ProductFormScalarKey, value: unknown): boolean {
  if (key === 'price' || key === 'stock') {
    if (value === null || value === undefined || value === '') {
      return true;
    }
    return Number(value) === 0;
  }
  return !String(value ?? '').trim();
}

function scalarsEqual(key: ProductFormScalarKey, current: unknown, incoming: unknown): boolean {
  if (key === 'price' || key === 'stock') {
    return Number(current) === Number(incoming);
  }
  return String(current ?? '').trim() === String(incoming ?? '').trim();
}

function specsEqual(a: ProductFormSpecDraft[], b: ProductFormSpecDraft[]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

@Injectable({ providedIn: 'root' })
export class ProductFormPrefillService {
  constructor(private fb: FormBuilder) {}

  captureSnapshot(form: FormGroup): ProductFormPrefillSnapshot {
    const scalars = {} as Record<ProductFormScalarKey, string | number>;
    for (const key of PRODUCT_FORM_SCALAR_KEYS) {
      scalars[key] = form.get(key)?.value ?? (key === 'price' || key === 'stock' ? 0 : '');
    }
    return { scalars, specifications: specRows(form) };
  }

  findConflicts(form: FormGroup, draft: ProductFormDraft): ProductFormScalarKey[] {
    const conflicts: ProductFormScalarKey[] = [];
    for (const key of PRODUCT_FORM_SCALAR_KEYS) {
      const incoming = draft[key];
      if (incoming === undefined || incoming === null || incoming === '') {
        continue;
      }
      const current = form.get(key)?.value;
      if (isProductFormScalarEmpty(key, current) || scalarsEqual(key, current, incoming)) {
        continue;
      }
      conflicts.push(key);
    }
    return conflicts;
  }

  hasSpecificationConflict(form: FormGroup, draft: ProductFormDraft): boolean {
    if (!draft.specifications?.length) {
      return false;
    }
    const current = specRows(form);
    if (areSpecificationsEmpty(current)) {
      return false;
    }
    return !specsEqual(current, draft.specifications);
  }

  applyDraft(
    form: FormGroup,
    draft: ProductFormDraft,
    mode: ProductFormPrefillMode,
  ): { snapshot: ProductFormPrefillSnapshot; changed: boolean } {
    const snapshot = this.captureSnapshot(form);
    let changed = false;

    for (const key of PRODUCT_FORM_SCALAR_KEYS) {
      const incoming = draft[key];
      if (incoming === undefined || incoming === null || incoming === '') {
        continue;
      }
      const control = form.get(key);
      if (!control) {
        continue;
      }
      const current = control.value;
      if (mode === 'merge' && !isProductFormScalarEmpty(key, current)) {
        continue;
      }
      if (scalarsEqual(key, current, incoming)) {
        continue;
      }
      control.setValue(incoming);
      changed = true;
    }

    if (draft.specifications) {
      const current = specRows(form);
      const shouldWrite =
        mode === 'overwrite' || areSpecificationsEmpty(current);
      if (shouldWrite && !specsEqual(current, draft.specifications)) {
        this.replaceSpecifications(form, draft.specifications);
        changed = true;
      }
    }

    if (changed) {
      form.markAsDirty();
      form.updateValueAndValidity();
    }

    return { snapshot, changed };
  }

  restoreSnapshot(form: FormGroup, snapshot: ProductFormPrefillSnapshot): void {
    form.patchValue(snapshot.scalars, { emitEvent: false });
    this.replaceSpecifications(form, snapshot.specifications);
    form.markAsDirty();
    form.updateValueAndValidity();
  }

  private replaceSpecifications(form: FormGroup, rows: ProductFormSpecDraft[]): void {
    const array = form.get('specifications') as FormArray | null;
    if (!array) {
      return;
    }
    while (array.length) {
      array.removeAt(0);
    }
    for (const row of rows) {
      array.push(
        this.fb.group({
          key: [row.key ?? '', Validators.required],
          value: [row.value ?? '', Validators.required],
        }),
      );
    }
  }
}
