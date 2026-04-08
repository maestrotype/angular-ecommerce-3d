
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';
import { User, UpdateUserRequest } from '../../../../shared/models/user.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-edit-dialog',
  templateUrl: './user-edit-dialog.component.html',
  styleUrls: ['./user-edit-dialog.component.scss']
})
export class UserEditDialogComponent implements OnInit {
  userForm: FormGroup;
  isLoading = false;
  isNewUser: boolean;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<UserEditDialogComponent>,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: { user?: User }
  ) {
    this.isNewUser = !data?.user;
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.data?.user) {
      this.userForm.patchValue(this.data.user);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['user', Validators.required],
      status: ['active', Validators.required],
      phone: ['']
    });
  }

  onSubmit(): void {
    if (this.userForm.valid && !this.isLoading) {
      this.isLoading = true;
      const formValue = this.userForm.value;

      if (this.isNewUser) {
        const createRequest = {
          ...formValue,
          password: 'defaultPassword123' // In real app, generate or ask user
        };
        this.userService.createUser(createRequest).subscribe({
          next: (user) => {
            this.snackBar.open(this.translate.instant('USER_CREATED_SUCCESSFULLY'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
            this.dialogRef.close(user);
          },
          error: (error) => {
            this.snackBar.open(this.translate.instant('ERROR_CREATING_USER'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
            this.isLoading = false;
          }
        });
      } else {
        // Only allow 'active' or 'inactive' for status
        let status: 'active' | 'inactive' = 'active';
        if (formValue.status === 'inactive') status = 'inactive';
        // fallback to 'active' if not valid
        const updateRequest: Partial<User> = {
          id: this.data.user!.id,
          ...formValue,
          status
        };
        this.userService.updateUser(updateRequest.id, updateRequest).subscribe({
          next: (user) => {
            this.snackBar.open(this.translate.instant('USER_UPDATED_SUCCESSFULLY'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
            this.dialogRef.close(user);
          },
          error: (error) => {
            this.snackBar.open(this.translate.instant('ERROR_UPDATING_USER'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
            this.isLoading = false;
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getTitle(): string {
    return this.isNewUser ? 'Create New User' : 'Edit User';
  }
}
