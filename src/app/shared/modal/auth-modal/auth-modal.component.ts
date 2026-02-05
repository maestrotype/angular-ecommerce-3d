import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ModalConfig } from '../../../core/services/modal.service';

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

  constructor(private authService: AuthService, private router: Router) {
    this.user = this.authService.getUser();
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
      return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain an uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain a lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain a number' };
    }
    return { valid: true, message: '' };
  }

  // Validate individual field
  validateField(field: string): void {
    switch (field) {
      case 'name':
        if (!this.registerForm.name || this.registerForm.name.trim().length < 2) {
          this.fieldErrors.name = 'Name must be at least 2 characters';
        } else {
          delete this.fieldErrors.name;
        }
        break;
      case 'email':
        if (!this.registerForm.email) {
          this.fieldErrors.email = 'Email is required';
        } else if (!this.validateEmail(this.registerForm.email)) {
          this.fieldErrors.email = 'Please enter a valid email';
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
          this.fieldErrors.confirmPassword = 'Passwords do not match';
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
      this.passwordStrength = { class: 'weak', text: 'Weak', percentage };
    } else if (percentage <= 70) {
      this.passwordStrength = { class: 'medium', text: 'Medium', percentage };
    } else {
      this.passwordStrength = { class: 'strong', text: 'Strong', percentage };
    }
  }

  onLogin(): void {
    this.error = '';
    if (!this.loginForm.email || !this.loginForm.password) {
      this.error = 'Enter email and password';
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
        this.error = err.error?.message || 'Authorization Error';
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
      this.fieldErrors.name = 'Name must be at least 2 characters';
      hasErrors = true;
    }

    // Validate email
    if (!this.registerForm.email) {
      this.fieldErrors.email = 'Email is required';
      hasErrors = true;
    } else if (!this.validateEmail(this.registerForm.email)) {
      this.fieldErrors.email = 'Please enter a valid email';
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
      this.fieldErrors.confirmPassword = 'Passwords do not match';
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
        const errorMessage = err.error?.message || 'Registration Error';

        // Handle specific errors
        if (errorMessage.includes('already registered') || errorMessage.includes('Email already')) {
          this.fieldErrors.email = 'This email is already registered';
        } else {
          this.error = errorMessage;
        }
      }
    });
  }
}