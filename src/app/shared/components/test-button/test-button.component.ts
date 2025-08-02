import { Component, Input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonStyle = 'solid' | 'outline' | 'ghost' | 'glass';

@Component({
  selector: 'app-test-button',
  templateUrl: './test-button.component.html',
  styleUrls: ['./test-button.component.scss']
})
export class TestButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() style: ButtonStyle = 'solid';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() rounded = false;
  @Input() icon?: string;
  @Input() text = 'Test Button';

  get buttonClasses(): string {
    const classes = ['btn'];
    
    // Add variant class
    if (this.style === 'outline') {
      classes.push(`btn-outline-${this.variant}`);
    } else if (this.style === 'ghost') {
      classes.push(`btn-ghost-${this.variant}`);
    } else if (this.style === 'glass') {
      classes.push('btn-glass');
    } else {
      classes.push(`btn-${this.variant}`);
    }
    
    // Add size class
    if (this.size !== 'md') {
      classes.push(`btn-${this.size}`);
    }
    
    // Add modifier classes
    if (this.loading) {
      classes.push('btn-loading');
    }
    
    if (this.fullWidth) {
      classes.push('btn-full');
    }
    
    if (this.rounded) {
      classes.push('btn-rounded');
    }
    
    if (this.icon && !this.text) {
      classes.push('btn-icon');
    }
    
    return classes.join(' ');
  }
} 