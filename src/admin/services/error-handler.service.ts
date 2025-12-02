import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../components/error-dialog/error-dialog.component';

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
    private dialog: MatDialog
  ) {}

  showError(error: ErrorInfo): void {
    this.showSnackBar(error);
  }

  showErrorWithDialog(error: ErrorInfo): void {
    this.dialog.open(ErrorDialogComponent, {
      width: '500px',
      data: error,
      disableClose: false
    });
  }

  showImageProcessingError(error: any): void {
    let errorInfo: ErrorInfo;

    if (error.status === 413) {
      errorInfo = {
        title: 'File too large',
        message: 'File size exceeds the allowed limit (10MB). Please select a smaller file.',
        type: 'error',
        action: 'OK'
      };
    } else if (error.status === 415) {
      errorInfo = {
        title: 'Unsupported format',
        message: 'File format is not supported. Use JPG, PNG or WEBP files.',
        type: 'error',
        action: 'OK'
      };
    } else if (error.status === 401) {
      errorInfo = {
        title: 'Authorization error',
        message: 'Failed to authorize with background removal service. Check API settings.',
        type: 'error',
        action: 'Configure API'
      };
    } else if (error.status === 429) {
      errorInfo = {
        title: 'Rate limit exceeded',
        message: 'Rate limit exceeded for background removal service. Try again later.',
        type: 'warning',
        action: 'Try later'
      };
    } else if (error.status === 500) {
      errorInfo = {
        title: 'Server error',
        message: 'Internal server error occurred while processing image.',
        type: 'error',
        action: 'Retry'
      };
    } else {
      errorInfo = {
        title: 'Processing error',
        message: 'Failed to process image. Try again or contact administrator.',
        details: error.message || 'Unknown error',
        type: 'error',
        action: 'Retry'
      };
    }

    this.showErrorWithDialog(errorInfo);
  }

  showDatabaseError(error: any): void {
    const errorInfo: ErrorInfo = {
      title: 'Database error',
      message: 'Failed to perform database operation.',
      details: error.message || 'Unknown database error',
      type: 'error',
      action: 'Retry'
    };

    this.showErrorWithDialog(errorInfo);
  }

  showNetworkError(error: any): void {
    const errorInfo: ErrorInfo = {
      title: 'Network error',
      message: 'Failed to connect to server. Check internet connection.',
      details: error.message || 'Network error',
      type: 'error',
      action: 'Retry'
    };

    this.showErrorWithDialog(errorInfo);
  }

  showValidationError(errors: string[]): void {
    const errorInfo: ErrorInfo = {
      title: 'Validation error',
      message: 'Please fix the following errors:',
      details: errors.join('\n'),
      type: 'warning',
      action: 'Fix'
    };

    this.showErrorWithDialog(errorInfo);
  }

  showSuccess(message: string): void {
    this.showSnackBar({
      title: 'Success',
      message,
      type: 'success'
    });
  }

  showInfo(message: string): void {
    this.showSnackBar({
      title: 'Information',
      message,
      type: 'info'
    });
  }

  showWarning(message: string): void {
    this.showSnackBar({
      title: 'Warning',
      message,
      type: 'warning'
    });
  }

  private showSnackBar(error: ErrorInfo): void {
    const duration = error.type === 'success' ? 3000 : 5000;
    
    this.snackBar.open(
      `${error.title}: ${error.message}`,
      error.action || 'Close',
      {
        duration,
        panelClass: [`admin-snackbar-${error.type}`]
      }
    );
  }

  handleGlobalError(error: any): void {
    
    
    if (error.status === 0) {
      this.showNetworkError(error);
    } else if (error.status >= 500) {
      this.showErrorWithDialog({
        title: 'Server error',
        message: 'Server error occurred. Try again later.',
        details: error.message,
        type: 'error',
        action: 'Retry'
      });
    } else {
      this.showErrorWithDialog({
        title: 'Error',
        message: 'An unexpected error occurred.',
        details: error.message,
        type: 'error',
        action: 'Close'
      });
    }
  }
} 