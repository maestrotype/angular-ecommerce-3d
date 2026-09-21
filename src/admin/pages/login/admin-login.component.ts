
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminAuthService } from '../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { translateErrorMessage } from '../../../shared/utils/localization.util';
import { environment } from '../../../environments/environment';

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
    private authService: AdminAuthService,
    private translate: TranslateService
  ) {
    this.loginForm = this.createForm();
  }

  createForm(): FormGroup {
    const prefill = environment.adminLoginPrefill ?? { email: '', password: '' };
    return this.fb.group({
      email: [prefill.email, [Validators.required, Validators.email]],
      password: [prefill.password, [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const credentials = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: () => {
          this.isLoading = false;
          if (!this.authService.isAdmin()) {
            this.authService.logout();
            this.snackBar.open(
              this.translate.instant('ADMIN_ACCESS_DENIED'),
              this.translate.instant('CLOSE_BTN'),
              { duration: 5000 }
            );
            return;
          }
          this.snackBar.open(this.translate.instant('LOGIN_SUCCESSFUL'), this.translate.instant('CLOSE_BTN'), { duration: 3000 });
          void this.router.navigate(['/admin/dashboard']);
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
