import { Component, Input, Output, EventEmitter } from '@angular/core';
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

  onClose(): void {
    this.close.emit();
  }

  switchView(view: 'login' | 'register'): void {
    this.currentView = view;
  }

  onLogin(): void {
    console.log('Login:', this.loginForm);
    // Логика авторизации
    this.onClose();
  }

  onRegister(): void {
    console.log('Register:', this.registerForm);
    // Логика регистрации
    this.onClose();
  }
}