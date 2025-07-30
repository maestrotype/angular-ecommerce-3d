import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../components/error-dialog/error-dialog.component';
import { ModalService } from '../../app/core/services/modal.service';

export interface ErrorInfo {
  title: string;
  message: string;
  details?: string;
  type: 'error' | 'warning' | 'info' | 'success';
  action?: string;
  actionCallback?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private modalService: ModalService
  ) {}

  showError(error: ErrorInfo): void {
    this.modalService.showError(error.title, error.message, error.details, 'admin');
  }

  showErrorWithDialog(error: ErrorInfo): void {
    this.modalService.showError(error.title, error.message, error.details, 'admin');
  }

  showImageProcessingError(error: any): void {
    let title = 'Processing error';
    let message = 'Failed to process image. Try again or contact administrator.';
    let details = error.message || 'Unknown error';

    if (error.status === 413) {
      title = 'File too large';
      message = 'File size exceeds the allowed limit (10MB). Please select a smaller file.';
      details = undefined;
    } else if (error.status === 415) {
      title = 'Unsupported format';
      message = 'File format is not supported. Use JPG, PNG or WEBP files.';
      details = undefined;
    } else if (error.status === 401) {
      title = 'Authorization error';
      message = 'Failed to authorize with background removal service. Check API settings.';
      details = undefined;
    } else if (error.status === 429) {
      title = 'Rate limit exceeded';
      message = 'Rate limit exceeded for background removal service. Try again later.';
      details = undefined;
    } else if (error.status === 500) {
      title = 'Server error';
      message = 'Internal server error occurred while processing image.';
      details = undefined;
    }

    this.modalService.showError(title, message, details, 'admin');
  }

  showDatabaseError(error: any): void {
    this.modalService.showError(
      'Database error',
      'Failed to perform database operation.',
      error.message || 'Unknown database error',
      'admin'
    );
  }

  showNetworkError(error: any): void {
    this.modalService.showError(
      'Network error',
      'Failed to connect to server. Check internet connection.',
      error.message || 'Network error',
      'admin'
    );
  }

  showValidationError(errors: string[]): void {
    this.modalService.showWarning(
      'Validation error',
      'Please fix the following errors:',
      errors.join('\n'),
      'admin'
    );
  }

  showSuccess(message: string): void {
    this.modalService.showSuccess('Success', message, 'admin');
  }

  showWarning(message: string): void {
    this.modalService.showWarning('Warning', message, undefined, 'admin');
  }

  showInfo(message: string): void {
    this.modalService.showInfo('Information', message, undefined, 'admin');
  }

  handleGlobalError(error: any): void {
    console.error('Global error:', error);
    
    if (error.status === 0) {
      this.showNetworkError(error);
    } else if (error.status >= 500) {
      this.modalService.showError(
        'Server error',
        'Server error occurred. Try again later.',
        error.message,
        'admin'
      );
    } else {
      this.modalService.showError(
        'Error',
        'An unexpected error occurred.',
        error.message,
        'admin'
      );
    }
  }
} 