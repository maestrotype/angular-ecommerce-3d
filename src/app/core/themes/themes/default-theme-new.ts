import { Theme } from '../theme.model';

export const defaultThemeNew: Theme = {
  id: 'default',
  name: 'Default',
  description: 'Clean modern design with blue primary colors',
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
    'bg-primary': '#f8f9fa',
    'bg-secondary': '#ffffff',
    'bg-tertiary': '#e9ecef',
    'bg-hover': '#e3f2fd',
    'bg-overlay': 'rgba(0, 0, 0, 0.5)',
    
    // Surface Colors
    'surface-primary': '#ffffff',
    'surface-secondary': '#f8f9fa',
    'surface-tertiary': '#e9ecef',
    'surface-hover': '#f1f3f4',
    
    // Text Colors
    'text-primary': '#333333',
    'text-secondary': '#666666',
    'text-tertiary': '#999999',
    'text-disabled': '#bdbdbd',
    'text-inverse': '#ffffff',
    'text-accent': '#667eea',
    
    // Border Colors
    'border-primary': '#e0e0e0',
    'border-secondary': '#f0f0f0',
    'border-tertiary': '#f5f5f5',
    'border-focus': '#1976d2',
    
    // Shadow Colors
    'shadow-light': 'rgba(0, 0, 0, 0.1)',
    'shadow-medium': 'rgba(0, 0, 0, 0.15)',
    'shadow-heavy': 'rgba(0, 0, 0, 0.25)',
    
    // Special Button Colors
    'auth-button-primary': '#e74c3c'
  },
  layout: {
    'container-max-width': '1200px',
    'container-padding': '0 20px',
    'grid-columns-desktop': 4,
    'grid-columns-tablet': 3,
    'grid-columns-mobile': 2,
    'grid-gap': '1rem',
    'cards-border-radius': '12px',
    'cards-shadow': '0 2px 8px rgba(0, 0, 0, 0.1)',
    'cards-padding': '1rem'
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
    'shadow-xs': '0 1px 3px rgba(0, 0, 0, 0.1)',
    'shadow-sm': '0 2px 4px rgba(0, 0, 0, 0.1)',
    'shadow-md': '0 4px 8px rgba(0, 0, 0, 0.1)',
    'shadow-lg': '0 8px 16px rgba(0, 0, 0, 0.1)',
    'shadow-xl': '0 12px 24px rgba(0, 0, 0, 0.15)',
    'shadow-xxl': '0 16px 32px rgba(0, 0, 0, 0.2)',
    
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
    'transition-slow': '0.5s ease',
    
    // Auth Modal Variables
    'auth-modal-bg': '#ffffff',
    'auth-modal-shadow': '0 20px 40px rgba(0, 0, 0, 0.1)',
    'auth-modal-border': '1px solid #e0e0e0',
    'auth-header-bg': '#f8f9fa',
    'auth-header-border': '1px solid #e0e0e0',
    'auth-tab-inactive': '#666666',
    'auth-tab-active': '#667eea',
    'auth-tab-active-bg': '#e3f2fd',
    'auth-tab-hover': '#333333',
    'auth-tab-hover-bg': '#f1f3f4',
    'auth-content-bg': '#ffffff',
    'auth-input-bg': '#ffffff',
    'auth-input-border': '1px solid #e0e0e0',
    'auth-input-focus': '#667eea',
    'auth-btn-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'auth-btn-secondary': '#f8f9fa',
    'auth-btn-secondary-text': '#666666',
    'auth-btn-secondary-border': '1px solid #e0e0e0',
    
    // Additional CSS variables for compatibility
    'color-text-tertiary': '#999999',
    'color-text-primary': '#333333',
    'color-text-secondary': '#666666',
    'color-text-inverse': '#ffffff',
    'color-primary': '#667eea',
    'color-surface-primary': '#ffffff',
    'color-surface-secondary': '#f8f9fa',
    'color-border-primary': '#e0e0e0'
  }
}; 