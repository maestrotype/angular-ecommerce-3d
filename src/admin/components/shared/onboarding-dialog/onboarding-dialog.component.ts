import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface OnboardingData {
  title: string;
  message: string;
  actionLabel: string;
  externalLink: string;
  icon?: string;
}

@Component({
  selector: 'app-onboarding-dialog',
  template: `
    <div class="onboarding-dialog dark-glass-theme">
      <div class="dialog-header">
        <mat-icon class="header-icon">{{ data.icon || 'auto_awesome' }}</mat-icon>
        <h2 mat-dialog-title>{{ data.title | translate }}</h2>
      </div>
      
      <mat-dialog-content>
        <p class="dialog-message">{{ data.message | translate }}</p>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button (click)="onSecondary()">{{ 'CANCEL' | translate }}</button>
        <button mat-flat-button color="primary" class="primary-btn" (click)="onPrimary()">
          {{ data.actionLabel | translate }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .onboarding-dialog {
      padding: 24px;
      background: rgba(30, 30, 40, 0.8) !important;
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      color: white;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .header-icon {
      color: #6366f1;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }

    .dialog-message {
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.6;
      margin-bottom: 24px;
    }

    mat-dialog-actions {
      padding: 0;
      gap: 12px;
    }

    .primary-btn {
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%) !important;
      border-radius: 8px;
    }
  `]
})
export class OnboardingDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<OnboardingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OnboardingData
  ) {}

  onPrimary(): void {
    window.open(this.data.externalLink, '_blank');
    this.dialogRef.close('setup');
  }

  onSecondary(): void {
    this.dialogRef.close();
  }
}
