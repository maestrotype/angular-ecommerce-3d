import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';
import { User, UpdateUserRequest } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-user-edit-dialog',
  templateUrl: './user-edit-dialog.component.html',
  styleUrls: ['./user-edit-dialog.component.scss']
})
export class UserEditDialogComponent {
  userForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<UserEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) {
    this.userForm = this.createForm();
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: [this.data.user.name, [Validators.required, Validators.minLength(2)]],
      email: [this.data.user.email, [Validators.required, Validators.email]],
      role: [this.data.user.role, [Validators.required]],
      status: [this.data.user.status || 'active', [Validators.required]],
      phone: [this.data.user.phone || '']
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isLoading = true;
      
      const updateData: UpdateUserRequest = {
        id: this.data.user.id,
        ...this.userForm.value
      };

      this.userService.updateUser(updateData).subscribe({
        next: (updatedUser) => {
          this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.snackBar.open('Error updating user', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email';
    }
    if (field?.hasError('minlength')) {
      return `${fieldName} must be at least ${field.errors?.['minlength'].requiredLength} characters`;
    }
    return '';
  }
}