
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { translateErrorMessage } from '../../../shared/utils/localization.util';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss',
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private translate: TranslateService
  ) {
    this.loginForm = this.createForm();
  }

  createForm(): FormGroup {
    return this.fb.group({
      email: ['admin@example.com', [Validators.required, Validators.email]],
      password: ['admin123', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const credentials = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open(this.translate.instant('LOGIN_SUCCESSFUL'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
          this.router.navigate(['/admin/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          const rawMsg = error.error?.message || 'LOGIN_FAILED_MSG';
          const msg = translateErrorMessage(rawMsg, this.translate);
          this.snackBar.open(msg, this.translate.instant('CLOSE_BTN'), { 
            duration: 5000 
          });
        }
      });
    }
  }
}
