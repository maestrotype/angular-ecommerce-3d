import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';

export interface ConfirmationData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  constructor(
    private dialog: MatDialog,
    private translate: TranslateService
  ) {}

  confirm(data: ConfirmationData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data,
      disableClose: true,
      panelClass: 'confirmation-dialog'
    });

    return dialogRef.afterClosed();
  }

  confirmDelete(itemName: string): Observable<boolean> {
    return this.confirm({
      title: this.translate.instant('CONFIRM_DELETE'),
      message: this.translate.instant('CONFIRM_DELETE_MESSAGE', { item: itemName }),
      confirmText: this.translate.instant('DELETE'),
      cancelText: this.translate.instant('CANCEL'),
      type: 'danger'
    });
  }

  confirmAction(action: string, itemName?: string): Observable<boolean> {
    const message = itemName 
      ? this.translate.instant('CONFIRM_ACTION_MESSAGE', { action, item: itemName })
      : this.translate.instant('CONFIRM_ACTION_GENERIC', { action });
      
    return this.confirm({
      title: this.translate.instant('CONFIRM_ACTION'),
      message,
      confirmText: this.translate.instant('CONFIRM'),
      cancelText: this.translate.instant('CANCEL'),
      type: 'warning'
    });
  }

  confirmSave(): Observable<boolean> {
    return this.confirm({
      title: this.translate.instant('CONFIRM_SAVE'),
      message: this.translate.instant('CONFIRM_SAVE_MESSAGE'),
      confirmText: this.translate.instant('SAVE'),
      cancelText: this.translate.instant('CANCEL'),
      type: 'info'
    });
  }

  confirmDiscard(): Observable<boolean> {
    return this.confirm({
      title: this.translate.instant('CONFIRM_DISCARD'),
      message: this.translate.instant('CONFIRM_DISCARD_MESSAGE'),
      confirmText: this.translate.instant('DISCARD'),
      cancelText: this.translate.instant('RETURN'),
      type: 'warning'
    });
  }
} 