import { Theme } from '../theme.model';

export const glassTheme: Theme = {
  id: 'glass',
  name: 'Glass',
  description: 'Modern glass morphism design with transparency and blur effects',
  colors: {
    // Primary Colors
    primary: '#667eea',
    'primary-light': '#8b9df0',
    'primary-dark': '#4a5fd8',
    'primary-hover': '#5a6fd8',
    
    // Secondary Colors
    secondary: '#764ba2',
    'secondary-light': '#9a6bb8',
    'secondary-dark': '#5d3a7f',
    'secondary-hover': '#6a4190',
    
    // Accent Colors
    accent: '#f093fb',
    'accent-light': '#f4b0fc',
    'accent-dark': '#e66ff0',
    'accent-hover': '#ed7ff5',
    
    // Semantic Colors
    success: '#4caf50',
    'success-light': '#66bb6a',
    'success-dark': '#388e3c',
    'success-hover': '#43a047',
    
    warning: '#ff9800',
    'warning-light': '#ffb74d',
    'warning-dark': '#f57c00',
    'warning-hover': '#ff8f00',
    
    error: '#f44336',
    'error-light': '#ef5350',
    'error-dark': '#d32f2f',
    'error-hover': '#e53935',
    
    info: '#2196f3',
    'info-light': '#42a5f5',
    'info-dark': '#1976d2',
    'info-hover': '#1e88e5',
    
    // Background Colors
    'bg-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'bg-secondary': 'rgba(255, 255, 255, 0.1)',
    'bg-tertiary': 'rgba(255, 255, 255, 0.05)',
    'bg-hover': 'rgba(255, 255, 255, 0.2)',
    'bg-overlay': 'rgba(0, 0, 0, 0.3)',
    
    // Surface Colors
    'surface-primary': 'rgba(255, 255, 255, 0.1)',
    'surface-secondary': 'rgba(255, 255, 255, 0.05)',
    'surface-tertiary': 'rgba(255, 255, 255, 0.02)',
    'surface-hover': 'rgba(255, 255, 255, 0.15)',
    
    // Text Colors
    'text-primary': '#ffffff',
    'text-secondary': 'rgba(255, 255, 255, 0.8)',
    'text-tertiary': 'rgba(255, 255, 255, 0.6)',
    'text-disabled': 'rgba(255, 255, 255, 0.4)',
    'text-inverse': '#333333',
    'text-accent': '#667eea',
    
    // Border Colors
    'border-primary': 'rgba(255, 255, 255, 0.2)',
    'border-secondary': 'rgba(255, 255, 255, 0.1)',
    'border-tertiary': 'rgba(255, 255, 255, 0.05)',
    'border-focus': '#667eea',
    
    // Shadow Colors
    'shadow-light': 'rgba(0, 0, 0, 0.1)',
    'shadow-medium': 'rgba(0, 0, 0, 0.15)',
    'shadow-heavy': 'rgba(0, 0, 0, 0.25)',
    
    // Special Button Colors
    'auth-button-primary': 'rgba(255,255,255,0.25)',
    'auth-button-hover': 'rgba(99,102,241,0.18)',
    'auth-button-shadow': 'rgba(51,65,85,0.10)',
    'special-offer-button': 'rgba(255,255,255,0.25)',
    'special-offer-button-hover': 'rgba(99,102,241,0.18)',
    'special-offer-button-shadow': 'rgba(51,65,85,0.10)',
    
    // Modal Colors
    'modal-bg': 'rgba(255,255,255,0.1)',
    'modal-header-bg': 'rgba(255,255,255,0.1)',
    'modal-border': 'rgba(255,255,255,0.2)',
    'input-bg': 'rgba(255,255,255,0.1)',
    'input-border': 'rgba(255,255,255,0.2)',
    'input-focus-border': '#6366f1',
    
    // Data Table Colors
    'table-bg': 'rgba(255, 255, 255, 0.1)',
    'table-border': 'rgba(255, 255, 255, 0.2)',
    'table-header-bg': 'rgba(255, 255, 255, 0.15)',
    'table-header-text': '#ffffff',
    'table-row-bg': 'rgba(255, 255, 255, 0.1)',
    'table-row-text': '#ffffff',
    'table-row-hover': 'rgba(255, 255, 255, 0.2)',
    'status-badge-bg': 'rgba(255, 255, 255, 0.15)',
    'status-badge-text': '#ffffff',
    'status-pending': '#ff9800',
    'status-success': '#4caf50',
    'status-error': '#f44336',
    'status-warning': '#ff9800',
    'status-info': '#2196f3',
    'action-button-color': '#f44336',
    'action-button-hover': 'rgba(244, 67, 54, 0.2)',
    'user-avatar-bg': 'rgba(255, 255, 255, 0.15)',
    'user-avatar-icon': 'rgba(255, 255, 255, 0.7)',
    'user-name-color': '#ffffff',
    'user-phone-color': 'rgba(255, 255, 255, 0.7)',
    'no-data-text': '#ffffff',
    'no-data-icon': 'rgba(255, 255, 255, 0.7)',
    'no-data-title': '#ffffff',
    'no-data-description': 'rgba(255, 255, 255, 0.7)',
    'paginator-bg': 'rgba(255, 255, 255, 0.1)',
    'paginator-text': '#ffffff',
    'paginator-border': 'rgba(255, 255, 255, 0.2)',
    'paginator-disabled': 'rgba(255, 255, 255, 0.4)',
    'paginator-arrow': 'rgba(255, 255, 255, 0.7)',
    'paginator-dropdown-bg': 'rgba(255, 255, 255, 0.1)',
    'paginator-dropdown-hover': 'rgba(255, 255, 255, 0.2)',
    'paginator-dropdown-active': '#667eea',
    'chip-bg': '#546e7a',
    'chip-text': '#ffffff',
    'chip-selected-bg': '#667eea',
    'chip-primary-bg': '#667eea',
    'chip-warn-bg': '#f44336',
    'chip-accent-bg': '#ff9800',
    'icon-button-color': '#f44336',
    'icon-button-hover': 'rgba(244, 67, 54, 0.2)',
    'icon-button-disabled': 'rgba(255, 255, 255, 0.4)',
    'icon-button-primary': '#667eea',
    'icon-button-primary-hover': 'rgba(102, 126, 234, 0.2)',
    'icon-button-warn': '#f44336',
    'icon-button-warn-hover': 'rgba(244, 67, 54, 0.2)',
    'form-label-color': 'rgba(255, 255, 255, 0.8)',
    'form-input-color': '#ffffff',
    'form-outline-color': 'rgba(255, 255, 255, 0.2)',
    'form-focus-color': '#667eea'
  },
  layout: {
    'container-max-width': '1200px',
    'container-padding': '0 20px',
    'grid-columns-desktop': 4,
    'grid-columns-tablet': 3,
    'grid-columns-mobile': 2,
    'grid-gap': '1rem',
    'cards-border-radius': '16px',
    'cards-shadow': '0 8px 32px rgba(0, 0, 0, 0.1)',
    'cards-padding': '1.5rem'
  },
  components: {
    // Typography
    'font-family-primary': "'Roboto', 'Helvetica Neue', sans-serif",
    'font-family-secondary': "'Inter', 'Segoe UI', sans-serif",
    'font-family-mono': "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
    
    // Font Sizes
    'font-size-xs': '0.75rem',
    'font-size-sm': '0.875rem',
    'font-size-md': '1rem',
    'font-size-lg': '1.125rem',
    'font-size-xl': '1.25rem',
    'font-size-xxl': '1.5rem',
    'font-size-xxxl': '2rem',
    
    // Font Weights
    'font-weight-light': '300',
    'font-weight-normal': '400',
    'font-weight-medium': '500',
    'font-weight-semibold': '600',
    'font-weight-bold': '700',
    
    // Line Heights
    'line-height-tight': '1.2',
    'line-height-normal': '1.4',
    'line-height-relaxed': '1.6',
    'line-height-loose': '1.8',
    
    // Spacing
    'spacing-xs': '0.25rem',
    'spacing-sm': '0.5rem',
    'spacing-md': '1rem',
    'spacing-lg': '1.5rem',
    'spacing-xl': '2rem',
    'spacing-xxl': '3rem',
    'spacing-xxxl': '4rem',
    
    // Border Radius
    'radius-xs': '0.125rem',
    'radius-sm': '0.25rem',
    'radius-md': '0.5rem',
    'radius-lg': '0.75rem',
    'radius-xl': '1rem',
    'radius-xxl': '1.5rem',
    'radius-full': '9999px',
    
    // Shadows
    'shadow-xs': '0 2px 4px rgba(0, 0, 0, 0.1)',
    'shadow-sm': '0 4px 8px rgba(0, 0, 0, 0.1)',
    'shadow-md': '0 8px 16px rgba(0, 0, 0, 0.1)',
    'shadow-lg': '0 16px 32px rgba(0, 0, 0, 0.1)',
    'shadow-xl': '0 24px 48px rgba(0, 0, 0, 0.15)',
    'shadow-xxl': '0 32px 64px rgba(0, 0, 0, 0.2)',
    
    // Z-Index
    'z-index-dropdown': '1000',
    'z-index-sticky': '1020',
    'z-index-fixed': '1030',
    'z-index-modal-backdrop': '1040',
    'z-index-modal': '1050',
    'z-index-popover': '1060',
    'z-index-tooltip': '1070',
    'z-index-toast': '1080',
    
    // Transitions
    'transition-fast': '0.15s ease',
    'transition-normal': '0.3s ease',
    'transition-slow': '0.5s ease'
  }
}; 