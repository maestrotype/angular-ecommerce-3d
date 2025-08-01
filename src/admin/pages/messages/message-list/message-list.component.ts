
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageService } from '../../../services/message.service';
import { Message } from '../../../models/message.model';
import { MessageDetailComponent } from '../message-detail/message-detail.component';

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

  displayedColumns: string[] = ['senderName', 'senderEmail', 'subject', 'status', 'createdAt', 'actions'];

  constructor(
    private messageService: MessageService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  loadMessages(): void {
    this.loading = true;
    this.messageService.getMessages().subscribe({
      next: (messages) => {
        this.messages = messages;
        this.filteredMessages = messages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.snackBar.open('Error loading messages', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.loadMessages();
  }

  onStatusFilterChange(): void {
    this.loadMessages();
  }

  viewMessage(message: Message): void {
    const dialogRef = this.dialog.open(MessageDetailComponent, {
      width: '800px',
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
        console.error('Error marking message as read:', error);
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
        console.error('Error archiving message:', error);
        this.snackBar.open('Error updating message', 'Close', { duration: 3000 });
      }
    });
  }

  deleteMessage(message: Message): void {
    if (confirm('Are you sure you want to delete this message?')) {
      this.messageService.deleteMessage(message.id).subscribe({
        next: () => {
          this.snackBar.open('Message deleted', 'Close', { duration: 3000 });
          this.loadMessages();
        },
        error: (error) => {
          console.error('Error deleting message:', error);
          this.snackBar.open('Error deleting message', 'Close', { duration: 3000 });
        }
      });
    }
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
