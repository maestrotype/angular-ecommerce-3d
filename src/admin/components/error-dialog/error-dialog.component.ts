import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ErrorInfo } from '../../services/error-handler.service';

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.scss']
})
export class ErrorDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ErrorInfo
  ) {}

  onAction(): void {
    if (this.data.actionCallback) {
      this.data.actionCallback();
    }
    this.dialogRef.close();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  getIcon(): string {
    switch (this.data.type) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      case 'success':
        return 'check_circle';
      default:
        return 'error';
    }
  }

  getIconColor(): string {
    switch (this.data.type) {
      case 'error':
        return 'var(--interactive-danger)';
      case 'warning':
        return 'var(--color-warning)';
      case 'info':
        return 'var(--color-info)';
      case 'success':
        return 'var(--color-success)';
      default:
        return 'var(--interactive-danger)';
    }
  }
} 