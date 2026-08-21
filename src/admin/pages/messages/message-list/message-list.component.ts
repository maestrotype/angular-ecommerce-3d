
import { Component, OnInit } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageService } from '../../../services/message.service';
import { Message } from '../../../models/message.model';
import { MessageDetailComponent } from '../message-detail/message-detail.component';
import { ConfirmationService } from '../../../services/confirmation.service';
import { take } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss']
})
export class MessageListComponent implements OnInit {
  messages: Message[] = [];
  filteredMessages: Message[] = [];
  loading = false;
  searchTerm = '';
  statusFilter = 'all';
  isMobile = false;

  displayedColumns: string[] = ['senderName', 'senderEmail', 'subject', 'status', 'createdAt', 'actions'];

  constructor(
    private messageService: MessageService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private breakpointObserver: BreakpointObserver,
    private confirmationService: ConfirmationService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadMessages();
    this.breakpointObserver.observe(['(max-width: 768px)']).subscribe(result => {
      this.isMobile = result.matches;
    });
  }

  loadMessages(): void {
    this.loading = true;
    this.messageService.getMessages().subscribe({
      next: (messages) => {
        this.messages = messages;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        
        this.snackBar.open('Error loading messages', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  senderInitial(name: string | undefined): string {
    const value = (name || '').trim();
    return value ? value.charAt(0).toUpperCase() : '?';
  }

  private applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredMessages = this.messages.filter((message) => {
      const matchesStatus = this.statusFilter === 'all' || message.status === this.statusFilter;
      if (!matchesStatus) {
        return false;
      }
      if (!term) {
        return true;
      }
      return [message.senderName, message.senderEmail, message.subject]
        .some((value) => (value || '').toLowerCase().includes(term));
    });
  }

  viewMessage(message: Message): void {
    const dialogRef = this.dialog.open(MessageDetailComponent, {
      width: '800px',
      maxWidth: '95vw',
      autoFocus: false,
      panelClass: 'message-detail-dialog',
      data: { message }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMessages();
      }
    });
  }

  markAsRead(message: Message): void {
    this.messageService.markAsRead(message.id).subscribe({
      next: () => {
        this.snackBar.open('Message marked as read', 'Close', { duration: 3000 });
        this.loadMessages();
      },
      error: (error) => {
        
        this.snackBar.open('Error updating message', 'Close', { duration: 3000 });
      }
    });
  }

  markAsArchived(message: Message): void {
    this.messageService.markAsArchived(message.id).subscribe({
      next: () => {
        this.snackBar.open('Message archived', 'Close', { duration: 3000 });
        this.loadMessages();
      },
      error: (error) => {
        
        this.snackBar.open('Error updating message', 'Close', { duration: 3000 });
      }
    });
  }

  deleteMessage(message: Message): void {
    const itemLabel = message.subject || this.translate.instant('MESSAGE_ITEM');
    this.confirmationService.confirmDelete(itemLabel).pipe(take(1)).subscribe((confirmed) => {
      if (confirmed) {
        this.messageService.deleteMessage(message.id).subscribe({
          next: () => {
            this.snackBar.open(
              this.translate.instant('MESSAGE_DELETED_SUCCESSFULLY'),
              this.translate.instant('CLOSE_BTN'),
              { duration: 3000 }
            );
            this.loadMessages();
          },
          error: () => {
            this.snackBar.open(
              this.translate.instant('ERROR_DELETING_MESSAGE'),
              this.translate.instant('CLOSE_BTN'),
              { duration: 3000 }
            );
          }
        });
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'new': return 'accent';
      case 'in_progress': return 'primary';
      case 'answered': return 'primary';
      case 'closed': return 'warn';
      default: return '';
    }
  }
}
