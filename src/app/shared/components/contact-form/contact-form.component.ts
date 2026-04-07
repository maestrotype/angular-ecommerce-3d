import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, CreateMessageDto } from '../../../core/services/message.service';
import { ModalService } from '../../../core/services/modal.service';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent {
  @Output() messageSent = new EventEmitter<void>();

  contactForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private modalService: ModalService,
    private translate: TranslateService
  ) {
    this.contactForm = this.fb.group({
      senderName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      senderEmail: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]]
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const messageData: CreateMessageDto = this.contactForm.value;

      this.messageService.createMessage(messageData).subscribe({
        next: (response) => {
          if (response.success) {
            this.modalService.showSuccess(
              this.translate.instant('CONTACTS.SUCCESS.TITLE'),
              this.translate.instant('CONTACTS.SUCCESS.MSG'),
              'storefront'
            );
            this.contactForm.reset();
            this.messageSent.emit();
          } else {
            this.modalService.showError(
              this.translate.instant('CONTACTS.ERROR.TITLE'),
              this.translate.instant('CONTACTS.ERROR.MSG'),
              response.error,
              'storefront'
            );
          }
        },
        error: (error) => {
          this.modalService.showError(
            this.translate.instant('CONTACTS.ERROR.TITLE'),
            this.translate.instant('CONTACTS.ERROR.MSG'),
            error.message,
            'storefront'
          );
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.contactForm.get(controlName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return this.translate.instant('CONTACTS.ERRORS.REQUIRED', { field: this.getFieldLabel(controlName) });
      }
      if (control.errors['email']) {
        return this.translate.instant('CONTACTS.ERRORS.EMAIL');
      }
      if (control.errors['minlength']) {
        return this.translate.instant('CONTACTS.ERRORS.MINLENGTH', {
          field: this.getFieldLabel(controlName),
          min: control.errors['minlength'].requiredLength
        });
      }
      if (control.errors['maxlength']) {
        return this.translate.instant('CONTACTS.ERRORS.MAXLENGTH', {
          field: this.getFieldLabel(controlName),
          max: control.errors['maxlength'].requiredLength
        });
      }
    }
    return '';
  }

  private getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      senderName: this.translate.instant('CONTACTS.FIELDS.NAME'),
      senderEmail: this.translate.instant('CONTACTS.FIELDS.EMAIL'),
      subject: this.translate.instant('CONTACTS.FIELDS.SUBJECT'),
      message: this.translate.instant('CONTACTS.FIELDS.MESSAGE')
    };
    return labels[controlName] || controlName;
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.contactForm.get(controlName);
    return !!(control?.invalid && control?.touched);
  }
} 