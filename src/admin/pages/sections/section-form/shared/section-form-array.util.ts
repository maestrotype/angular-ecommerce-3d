import { FormArray, FormGroup } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

export function setFormArray<T>(
  array: FormArray,
  items: T[],
  builder: (item: T) => FormGroup
): void {
  while (array.length) {
    array.removeAt(0);
  }
  items.forEach((item) => array.push(builder(item)));
}

export function dropFormArrayItem(
  array: FormArray,
  event: CdkDragDrop<FormArray>
): void {
  const from = event.previousIndex;
  const to = event.currentIndex;
  if (from === to) {
    return;
  }
  const control = array.at(from);
  array.removeAt(from);
  array.insert(to, control);
}

export function dropFormArrayItemMove(
  array: FormArray,
  event: CdkDragDrop<FormArray>
): void {
  moveItemInArray(array.controls, event.previousIndex, event.currentIndex);
  array.updateValueAndValidity();
}

export function normalizeUploadedUrl(url: string): string {
  if (url.startsWith('http')) {
    return url;
  }
  return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
}
