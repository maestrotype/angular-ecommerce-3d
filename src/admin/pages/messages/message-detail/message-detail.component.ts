
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageService } from '../../../services/message.service';
import { Message, ReplyMessageDto } from '../../../models/message.model';

@Component({
  selector: 'app-message-detail',
  templateUrl: './message-detail.component.html',
  styleUrls: ['./message-detail.component.scss']
})
export class MessageDetailComponent implements OnInit {
  message: Message;
  replyForm: FormGroup;
  showReplyForm = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<MessageDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: Message }
  ) {
    this.message = data.message;
    this.replyForm = this.createReplyForm();
  }

  ngOnInit(): void {
    if (this.message.status === 'new') {
      this.markAsRead();
    }
  }

  private createReplyForm(): FormGroup {
    return this.fb.group({
      reply: ['', [Validators.required, Validators.maxLength(2000)]]
    });
  }

  markAsRead(): void {
    this.messageService.markAsRead(this.message.id).subscribe({
      next: (updatedMessage) => {
        this.message = updatedMessage;
      },
      error: (error) => {
        console.error('Error marking message as read:', error);
      }
    });
  }

  toggleReplyForm(): void {
    this.showReplyForm = !this.showReplyForm;
  }

  onReplySubmit(): void {
    if (this.replyForm.valid) {
      this.loading = true;
      const replyData: ReplyMessageDto = {
        reply: this.replyForm.value.reply
      };

      this.messageService.replyToMessage(this.message.id, replyData).subscribe({
        next: (updatedMessage) => {
          this.message = updatedMessage;
          this.snackBar.open('Reply sent successfully', 'Close', { duration: 3000 });
          this.showReplyForm = false;
          this.replyForm.reset();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error sending reply:', error);
          this.snackBar.open('Error sending reply', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }

  onClose(): void {
    this.dialogRef.close(true);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'new': return 'accent';
      case 'read': return 'primary';
      case 'archived': return 'warn';
      default: return '';
    }
  }
}
