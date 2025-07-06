import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalConfig } from '../../../core/services/modal.service';
import { AuthService } from 'src/app/core/services/auth.service';

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

  constructor(private authService: AuthService) {}

  onClose(): void {
    this.close.emit();
  }

  switchView(view: 'login' | 'register'): void {
    this.currentView = view;
    this.error = '';
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
        this.loading = false;
        this.onClose();
        window.location.reload();
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
        this.loading = false;
        this.onClose();
        window.location.reload();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration Error';
      }
    });
  }
}