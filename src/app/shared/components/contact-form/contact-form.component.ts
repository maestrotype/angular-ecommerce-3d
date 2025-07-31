import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, CreateMessageDto } from '../../../core/services/message.service';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-contact-form',
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
    private modalService: ModalService
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
              'Message Sent', 
              'Thank you for your message. We will get back to you soon!',
              'storefront'
            );
            this.contactForm.reset();
            this.messageSent.emit();
          } else {
            this.modalService.showError(
              'Error', 
              'Failed to send message. Please try again.',
              response.error,
              'storefront'
            );
          }
        },
        error: (error) => {
          this.modalService.showError(
            'Error', 
            'Failed to send message. Please try again.',
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
        return `${this.getFieldLabel(controlName)} is required`;
      }
      if (control.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (control.errors['minlength']) {
        return `${this.getFieldLabel(controlName)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['maxlength']) {
        return `${this.getFieldLabel(controlName)} must be no more than ${control.errors['maxlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  private getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      senderName: 'Name',
      senderEmail: 'Email',
      subject: 'Subject',
      message: 'Message'
    };
    return labels[controlName] || controlName;
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.contactForm.get(controlName);
    return !!(control?.invalid && control?.touched);
  }
} 