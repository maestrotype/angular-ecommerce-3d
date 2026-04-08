import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../components/error-dialog/error-dialog.component';
import { TranslateService } from '@ngx-translate/core';

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
    private translate: TranslateService
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
        title: this.translate.instant('FILE_TOO_LARGE_TITLE'),
        message: this.translate.instant('FILE_TOO_LARGE_MSG'),
        type: 'error',
        action: this.translate.instant('OK_BTN')
      };
    } else if (error.status === 415) {
      errorInfo = {
        title: this.translate.instant('UNSUPPORTED_FORMAT_TITLE'),
        message: this.translate.instant('UNSUPPORTED_FORMAT_MSG'),
        type: 'error',
        action: this.translate.instant('OK_BTN')
      };
    } else if (error.status === 401) {
      errorInfo = {
        title: this.translate.instant('AUTH_ERROR_TITLE'),
        message: this.translate.instant('AUTH_ERROR_MSG'),
        type: 'error',
        action: this.translate.instant('CONFIGURE_API_BTN')
      };
    } else if (error.status === 429) {
      errorInfo = {
        title: this.translate.instant('RATE_LIMIT_TITLE'),
        message: this.translate.instant('RATE_LIMIT_MSG'),
        type: 'warning',
        action: this.translate.instant('TRY_LATER_BTN')
      };
    } else if (error.status === 500) {
      errorInfo = {
        title: this.translate.instant('SERVER_ERROR_TITLE'),
        message: this.translate.instant('SERVER_ERROR_MSG'),
        type: 'error',
        action: this.translate.instant('RETRY_BTN')
      };
    } else {
      errorInfo = {
        title: this.translate.instant('PROCESSING_ERROR_TITLE'),
        message: this.translate.instant('PROCESSING_ERROR_MSG'),
        details: error.message || 'Unknown error',
        type: 'error',
        action: this.translate.instant('RETRY_BTN')
      };
    }

    this.showErrorWithDialog(errorInfo);
  }

  showDatabaseError(error: any): void {
    const errorInfo: ErrorInfo = {
      title: this.translate.instant('DATABASE_ERROR_TITLE'),
      message: this.translate.instant('DATABASE_ERROR_MSG'),
      details: error.message || 'Unknown database error',
      type: 'error',
      action: this.translate.instant('RETRY_BTN')
    };

    this.showErrorWithDialog(errorInfo);
  }

  showNetworkError(error: any): void {
    const errorInfo: ErrorInfo = {
      title: this.translate.instant('NETWORK_ERROR_TITLE'),
      message: this.translate.instant('NETWORK_ERROR_MSG'),
      details: error.message || 'Network error',
      type: 'error',
      action: this.translate.instant('RETRY_BTN')
    };

    this.showErrorWithDialog(errorInfo);
  }

  showValidationError(errors: string[]): void {
    const errorInfo: ErrorInfo = {
      title: this.translate.instant('VALIDATION_ERROR_TITLE'),
      message: this.translate.instant('VALIDATION_ERROR_MSG'),
      details: errors.join('\n'),
      type: 'warning',
      action: this.translate.instant('FIX_BTN')
    };

    this.showErrorWithDialog(errorInfo);
  }

  showSuccess(message: string): void {
    this.showSnackBar({
      title: this.translate.instant('SUCCESS_TITLE'),
      message,
      type: 'success'
    });
  }

  showInfo(message: string): void {
    this.showSnackBar({
      title: this.translate.instant('INFO_TITLE'),
      message,
      type: 'info'
    });
  }

  showWarning(message: string): void {
    this.showSnackBar({
      title: this.translate.instant('WARNING_TITLE'),
      message,
      type: 'warning'
    });
  }

  private showSnackBar(error: ErrorInfo): void {
    const duration = error.type === 'success' ? 3000 : 5000;
    
    this.snackBar.open(
      `${error.title}: ${error.message}`,
      error.action || this.translate.instant('CLOSE_BTN'),
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
        title: this.translate.instant('SERVER_ERROR_TITLE'),
        message: this.translate.instant('SERVER_ERROR_MSG'),
        details: error.message,
        type: 'error',
        action: this.translate.instant('RETRY_BTN')
      });
    } else {
      this.showErrorWithDialog({
        title: this.translate.instant('ERROR_UPDATING_PRODUCT'), // Fallback generic title or specific if needed
        message: this.translate.instant('UNEXPECTED_ERROR'),
        details: error.message,
        type: 'error',
        action: this.translate.instant('CLOSE_BTN')
      });
    }
  }
} 