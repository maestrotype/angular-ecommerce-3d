import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Section } from '../../../../models/section.model';
import { SectionService } from '../../../../services/section.service';
import { getSectionHash, findSectionByHash } from '../../../../../shared/utils/section-anchor.util';
import {
  MENU_ACCESS_OPTIONS,
  SECTION_VARIANTS,
} from '../shared/section-form.constants';
import { normalizeUploadedUrl } from '../shared/section-form-array.util';

@Component({
  selector: 'app-section-header-form',
  templateUrl: './header-form.component.html',
  styleUrls: ['../section-form.component.scss'],
})
export class SectionHeaderFormComponent implements OnInit {
  @Input({ required: true }) sectionForm!: FormGroup;
  @Input() activeMenuLang = 'en';

  availableSections: Section[] = [];
  uploadingLogo = false;
  readonly variants = SECTION_VARIANTS;
  readonly menuAccessOptions = MENU_ACCESS_OPTIONS;

  constructor(
    private fb: FormBuilder,
    private sectionService: SectionService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadAvailableSections();
  }

  get menu(): FormArray {
    return this.sectionForm.get('menu') as FormArray;
  }

  private loadAvailableSections(): void {
    this.sectionService.getSections().subscribe((sections) => {
      this.availableSections = sections.filter(
        (section) =>
          section.type !== 'header' &&
          section.type !== 'footer' &&
          section.isActive !== false &&
          section.pageTarget === 'home'
      );
      this.syncMenuSectionIdsFromUrls();
    });
  }

  private syncMenuSectionIdsFromUrls(): void {
    this.menu.controls.forEach((control) => {
      const url = control.get('url')?.value as string;
      const currentId = control.get('sectionId')?.value;
      if (!url?.startsWith('#') || currentId) {
        return;
      }
      const match = findSectionByHash(this.availableSections, url);
      if (match?.id) {
        control.patchValue({ sectionId: match.id }, { emitEvent: false });
      }
    });
  }

  addMenuItem(): void {
    this.menu.push(
      this.fb.group({
        title: this.fb.group({
          en: ['', Validators.required],
          ru: [''],
          ua: [''],
        }),
        url: ['', Validators.required],
        access: ['all', Validators.required],
        isActive: [true],
        sectionId: [null],
      })
    );
  }

  removeMenuItem(index: number): void {
    this.menu.removeAt(index);
  }

  dropMenuItem(event: CdkDragDrop<FormArray>): void {
    const from = event.previousIndex;
    const to = event.currentIndex;
    if (from === to) return;
    const control = this.menu.at(from);
    this.menu.removeAt(from);
    this.menu.insert(to, control);
  }

  onSectionSelect(index: number, sectionId: number | null): void {
    const menuItem = this.menu.at(index);
    if (sectionId) {
      const section = this.availableSections.find((s) => s.id === sectionId);
      if (section) {
        menuItem.patchValue({ url: getSectionHash(section), sectionId });
      }
    } else {
      menuItem.patchValue({ sectionId: null });
    }
  }

  onLogoFileSelected(file: File): void {
    this.uploadingLogo = true;
    this.sectionService.uploadImage(file).subscribe({
      next: (response) => {
        if (response?.url) {
          this.sectionForm.patchValue({
            logoUrl: normalizeUploadedUrl(response.url),
          });
        }
        this.uploadingLogo = false;
      },
      error: () => {
        this.uploadingLogo = false;
        this.snackBar.open(
          this.translate.instant('ERROR_UPLOADING_LOGO'),
          this.translate.instant('CLOSE_BTN'),
          { duration: 3000 }
        );
      },
    });
  }

  onLogoUploaded(url: string): void {
    this.sectionForm.patchValue({ logoUrl: url });
    this.uploadingLogo = false;
  }
}
