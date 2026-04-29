import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface AiWarningData {
  provider: string;
  title: string;
  message: string;
  instructions: string;
}

@Component({
  selector: 'app-ai-warning-dialog',
  template: `
    <div class="ai-warning-dialog dark-glass-theme">
      <div class="dialog-header">
        <mat-icon class="header-icon">warning_amber</mat-icon>
        <h2 mat-dialog-title>{{ data.title | translate }}</h2>
      </div>
      
      <mat-dialog-content>
        <p class="dialog-message">{{ data.message | translate }}</p>
        
        <div class="instructions-card">
          <div class="card-header">
            <mat-icon>info</mat-icon>
            <span>{{ 'INFO_TITLE' | translate }}</span>
          </div>
          <div class="card-body">
            {{ data.instructions | translate }}
          </div>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button (click)="onContinue()">{{ 'AI_PROVIDER.CONTINUE_ANYWAY' | translate }}</button>
        <button mat-flat-button color="primary" class="primary-btn" (click)="onSwitch()">
          <mat-icon>auto_awesome</mat-icon>
          {{ 'AI_PROVIDER.SWITCH_TO_WORKING' | translate }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .ai-warning-dialog {
      padding: 24px;
      padding-top: 16px;
      background: rgba(30, 30, 40, 0.8) !important;
      backdrop-filter: blur(25px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      color: white;
      max-width: 450px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }

    .header-icon {
      color: #fbbf24;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    h2 {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      letter-spacing: -0.5px;
    }

    .dialog-message {
      color: rgba(255, 255, 255, 0.9);
      font-size: 15px;
      line-height: 1.5;
      margin-bottom: 20px;
    }

    .instructions-card {
      background: rgba(99, 102, 241, 0.1);
      border-left: 4px solid #6366f1;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #818cf8;
      margin-bottom: 8px;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .card-header mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .card-body {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      line-height: 1.6;
      white-space: pre-wrap;
    }

    mat-dialog-actions {
      padding: 0;
      gap: 12px;
    }

    .primary-btn {
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%) !important;
      border-radius: 10px;
      padding: 0 20px;
      font-weight: 500;
    }

    button mat-icon {
        margin-right: 4px;
    }
  `]
})
export class AiWarningDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AiWarningDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AiWarningData
  ) {}

  onSwitch(): void {
    this.dialogRef.close('switch');
  }

  onContinue(): void {
    this.dialogRef.close('continue');
  }
}
