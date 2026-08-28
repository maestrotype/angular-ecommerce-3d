import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { dropFormArrayItemMove } from '../shared/section-form-array.util';
import { SECTION_VARIANTS } from '../shared/section-form.constants';

@Component({
  selector: 'app-section-footer-form',
  templateUrl: './footer-form.component.html',
  styleUrls: ['../section-form.component.scss'],
})
export class SectionFooterFormComponent {
  @Input({ required: true }) sectionForm!: FormGroup;
  @Input() activeMenuLang = 'en';

  readonly variants = SECTION_VARIANTS;

  constructor(private fb: FormBuilder) {}

  get columns(): FormArray {
    return this.sectionForm.get('columns') as FormArray;
  }

  getLinks(columnIndex: number): FormArray {
    return this.columns.at(columnIndex).get('links') as FormArray;
  }

  addFooterColumn(): void {
    this.columns.push(
      this.fb.group({
        title: this.fb.group({ en: [''], ru: [''], ua: [''] }),
        links: this.fb.array([]),
      })
    );
  }

  removeFooterColumn(index: number): void {
    this.columns.removeAt(index);
  }

  addFooterLink(columnIndex: number): void {
    this.getLinks(columnIndex).push(
      this.fb.group({
        label: this.fb.group({ en: [''], ru: [''], ua: [''] }),
        url: ['', Validators.required],
      })
    );
  }

  removeFooterLink(columnIndex: number, linkIndex: number): void {
    this.getLinks(columnIndex).removeAt(linkIndex);
  }

  dropFooterColumn(event: CdkDragDrop<FormArray>): void {
    dropFormArrayItemMove(this.columns, event);
  }

  dropFooterLink(columnIndex: number, event: CdkDragDrop<FormArray>): void {
    dropFormArrayItemMove(this.getLinks(columnIndex), event);
  }
}
