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
    if (!this.registerForm.name || !this.registerForm.email || !this.registerForm.password) {
      this.error = 'Fill in all fields';
      return;
    }
    if (this.registerForm.password !== this.registerForm.confirmPassword) {
      this.error = 'The passwords do not match';
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
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration Error';
      }
    });
  }
}