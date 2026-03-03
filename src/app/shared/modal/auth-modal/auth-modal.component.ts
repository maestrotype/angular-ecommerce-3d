import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ModalConfig } from '../../../core/services/modal.service';
import { SocialAuthService, GoogleLoginProvider, FacebookLoginProvider, SocialUser } from '@abacritt/angularx-social-login';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.scss']
})
export class AuthModalComponent {
  @Input() config!: ModalConfig;
  @Output() close = new EventEmitter<void>();

  currentView: 'login' | 'register' = 'login';
  error: string = '';
  loading: boolean = false;
  user: any = null;

  // Field-specific errors
  fieldErrors: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  } = {};

  // Password strength indicator
  passwordStrength: { class: string; text: string; percentage: number } | null = null;

  loginForm = {
    email: '',
    password: ''
  };

  registerForm = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private socialAuthService: SocialAuthService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private translate: TranslateService
  ) {
    this.user = this.authService.getUser();
    this.registerSocialIcons();

    // Listen to social auth state
    this.socialAuthService.authState.subscribe((user: SocialUser) => {
      if (user) {
        this.handleSocialLogin(user);
      }
    });
  }

  private handleSocialLogin(socialUser: SocialUser): void {
    this.loading = true;
    this.authService.socialLogin(socialUser.provider, socialUser.idToken).subscribe({
      next: (res) => {
        this.authService.saveAuthData(res.token, res.user);
        this.user = res.user;
        this.loading = false;
        this.onClose(); // Close modal on success
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || this.translate.instant('MODALS.AUTH.ERRORS.SOCIAL_ERROR', { provider: socialUser.provider });
      }
    });
  }

  signInWithGoogle(): void {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  signInWithFacebook(): void {
    this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  signInWithGithub(): void {
    // Placeholder (simulated)
    this.error = this.translate.instant('MODALS.AUTH.ERRORS.GITHUB_COMING_SOON');
  }

  signInWithApple(): void {
    // Placeholder (simulated)
    this.error = this.translate.instant('MODALS.AUTH.ERRORS.APPLE_COMING_SOON');
  }

  private registerSocialIcons(): void {
    const icons = [
      { name: 'google', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.954,4,4,12.954,4,24s8.954,20,20,20s20-8.954,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1565c0" d="M43.611,20.083L43.611,20.083L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>' },
      { name: 'facebook', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#039be5" d="M24 5A19 19 0 1 0 24 43A19 19 0 1 0 24 5Z"/><path fill="#fff" d="M26.572,29.036h4.917l0.772-4.995h-5.69v-2.73c0-2.075,0.678-3.915,2.619-3.915h3.119v-4.359c-0.548-0.074-1.707-0.236-3.897-0.236c-4.573,0-7.254,2.415-7.254,7.917v3.323h-4.701v4.995h4.701v13.729C22.089,42.905,23.032,43,24,43c0.875,0,1.729-0.08,2.572-0.194V29.036z"/></svg>' },
      { name: 'github', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#212121" d="M24,4C12.954,4,4,12.954,4,24c0,8.837,5.73,16.325,13.673,18.969c1,0.184,1.367-0.434,1.367-0.965 c0-0.476-0.017-1.737-0.027-3.411c-5.564,1.208-6.738-2.682-6.738-2.682c-0.91-2.311-2.22-2.926-2.22-2.926 c-1.816-1.241,0.138-1.216,0.138-1.216c2.008,0.141,3.065,2.062,3.065,2.062c1.784,3.057,4.678,2.174,5.817,1.662 c0.181-1.293,0.698-2.175,1.27-2.674c-4.442-0.505-9.112-2.221-9.112-9.886c0-2.184,0.78-3.969,2.06-5.368 c-0.206-0.506-0.893-2.54,0.196-5.295c0,0,1.68-0.538,5.503,2.051c1.596-0.444,3.308-0.666,5.009-0.674 c1.7,0.008,3.412,0.23,5.011,0.674c3.82-2.589,5.498-2.051,5.498-2.051c1.092,2.755,0.405,4.789,0.199,5.295 c1.282,1.399,2.057,3.184,2.057,5.368c0,7.684-4.678,9.375-9.134,9.87c0.718,0.618,1.358,1.839,1.358,3.706 c0,2.677-0.024,4.836-0.024,5.492c0,0.536,0.362,1.159,1.375,0.963C38.273,40.321,44,32.835,44,24C44,12.954,35.046,4,24,4z"/></svg>' },
      { name: 'apple', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path d="M36,25.3c0,4.4,3.7,5.9,3.7,6c0,0-0.6,2.1-2.1,4.2c-1.3,1.8-2.6,3.6-4.6,3.6c-1.9,0-2.5-1.2-4.7-1.2 c-2.2,0-2.8,1.1-4.7,1.2c-2,0-3.5-1.9-4.8-3.8c-2.7-3.9-4.8-11.1-2-15.9c1.4-2.4,3.8-3.9,6.5-3.9c2,0,4,1.4,5.2,1.4 c1.2,0,3.6-1.7,6-1.4c1,0,3.9,0.4,5.7,3.1C36.6,19.3,36,25.2,36,25.3z M27.8,11.5c1.1-1.3,1.8-3.1,1.6-4.9c-1.6,0.1-3.5,1.1-4.6,2.4 c-1,1.2-1.9,3-1.7,4.8C24.9,13.9,26.7,12.8,27.8,11.5z"/></svg>' }
    ];

    icons.forEach(icon => {
      this.iconRegistry.addSvgIconLiteral(
        icon.name,
        this.sanitizer.bypassSecurityTrustHtml(icon.svg)
      );
    });
  }

  onClose(): void {
    this.close.emit();
  }

  switchView(view: 'login' | 'register'): void {
    this.currentView = view;
    this.error = '';
    this.fieldErrors = {};
    this.passwordStrength = null;
  }

  logout(): void {
    this.authService.logout();
    this.user = null;
    this.error = '';
  }

  goToMyOrders(): void {
    this.close.emit();
    this.router.navigate(['/my-orders']);
  }

  // Email validation
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Password validation
  private validatePassword(password: string): { valid: boolean; message: string } {
    if (password.length < 8) {
      return { valid: false, message: this.translate.instant('MODALS.AUTH.ERRORS.PASSWORD_MIN_LENGTH') };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: this.translate.instant('MODALS.AUTH.ERRORS.PASSWORD_UPPERCASE') };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: this.translate.instant('MODALS.AUTH.ERRORS.PASSWORD_LOWERCASE') };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: this.translate.instant('MODALS.AUTH.ERRORS.PASSWORD_NUMBER') };
    }
    return { valid: true, message: '' };
  }

  // Validate individual field
  validateField(field: string): void {
    switch (field) {
      case 'name':
        if (!this.registerForm.name || this.registerForm.name.trim().length < 2) {
          this.fieldErrors.name = this.translate.instant('MODALS.AUTH.ERRORS.NAME_MIN_LENGTH');
        } else {
          delete this.fieldErrors.name;
        }
        break;
      case 'email':
        if (!this.registerForm.email) {
          this.fieldErrors.email = this.translate.instant('MODALS.AUTH.ERRORS.EMAIL_REQUIRED');
        } else if (!this.validateEmail(this.registerForm.email)) {
          this.fieldErrors.email = this.translate.instant('MODALS.AUTH.ERRORS.EMAIL_INVALID');
        } else {
          delete this.fieldErrors.email;
        }
        break;
      case 'password':
        const passwordCheck = this.validatePassword(this.registerForm.password);
        if (!passwordCheck.valid) {
          this.fieldErrors.password = passwordCheck.message;
        } else {
          delete this.fieldErrors.password;
        }
        break;
      case 'confirmPassword':
        if (this.registerForm.password !== this.registerForm.confirmPassword) {
          this.fieldErrors.confirmPassword = this.translate.instant('MODALS.AUTH.ERRORS.PASSWORDS_MISMATCH');
        } else {
          delete this.fieldErrors.confirmPassword;
        }
        break;
    }
  }

  // Check password strength
  checkPasswordStrength(): void {
    const password = this.registerForm.password;

    if (!password) {
      this.passwordStrength = null;
      return;
    }

    let strength = 0;
    let maxStrength = 5;

    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    // Character type checks
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const percentage = (strength / maxStrength) * 100;

    if (percentage <= 40) {
      this.passwordStrength = { class: 'weak', text: this.translate.instant('MODALS.AUTH.STRENGTH.WEAK'), percentage };
    } else if (percentage <= 70) {
      this.passwordStrength = { class: 'medium', text: this.translate.instant('MODALS.AUTH.STRENGTH.MEDIUM'), percentage };
    } else {
      this.passwordStrength = { class: 'strong', text: this.translate.instant('MODALS.AUTH.STRENGTH.STRONG'), percentage };
    }
  }

  onLogin(): void {
    this.error = '';
    if (!this.loginForm.email || !this.loginForm.password) {
      this.error = this.translate.instant('MODALS.AUTH.ERRORS.REQUIRED_EMAIL_PASSWORD');
      return;
    }
    this.loading = true;
    this.authService.login(this.loginForm.email, this.loginForm.password).subscribe({
      next: (res) => {
        this.authService.saveAuthData(res.token, res.user);
        this.user = res.user; // Stay on modal and show profile on Login tab
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || this.translate.instant('MODALS.AUTH.ERRORS.AUTH_ERROR');
      }
    });
  }

  onRegister(): void {
    this.error = '';
    this.fieldErrors = {};

    // Validate all fields
    let hasErrors = false;

    // Validate name
    if (!this.registerForm.name || this.registerForm.name.trim().length < 2) {
      this.fieldErrors.name = this.translate.instant('MODALS.AUTH.ERRORS.NAME_MIN_LENGTH');
      hasErrors = true;
    }

    // Validate email
    if (!this.registerForm.email) {
      this.fieldErrors.email = this.translate.instant('MODALS.AUTH.ERRORS.EMAIL_REQUIRED');
      hasErrors = true;
    } else if (!this.validateEmail(this.registerForm.email)) {
      this.fieldErrors.email = this.translate.instant('MODALS.AUTH.ERRORS.EMAIL_INVALID');
      hasErrors = true;
    }

    // Validate password
    const passwordCheck = this.validatePassword(this.registerForm.password);
    if (!passwordCheck.valid) {
      this.fieldErrors.password = passwordCheck.message;
      hasErrors = true;
    }

    // Validate confirm password
    if (this.registerForm.password !== this.registerForm.confirmPassword) {
      this.fieldErrors.confirmPassword = this.translate.instant('MODALS.AUTH.ERRORS.PASSWORDS_MISMATCH');
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    this.loading = true;
    this.authService.register(
      this.registerForm.name,
      this.registerForm.email,
      this.registerForm.password
    ).subscribe({
      next: (res) => {
        this.authService.saveAuthData(res.token, res.user);
        this.user = res.user; // Remain in modal; user can switch tabs or logout
        this.loading = false;
        this.registerForm = { name: '', email: '', password: '', confirmPassword: '' };
        this.passwordStrength = null;
      },
      error: (err) => {
        this.loading = false;
        const errorMessage = err.error?.message || this.translate.instant('MODALS.AUTH.ERRORS.REG_ERROR');

        // Handle specific errors
        if (errorMessage.includes('already registered') || errorMessage.includes('Email already')) {
          this.fieldErrors.email = this.translate.instant('MODALS.AUTH.ERRORS.EMAIL_ALREADY_REGISTERED');
        } else {
          this.error = errorMessage;
        }
      }
    });
  }
}