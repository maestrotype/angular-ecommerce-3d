import { Theme } from '../theme.model';

export const lightTheme: Theme = {
  id: 'light',
  name: 'Light',
  description: 'Clean modern design with blue primary colors',
  colors: {
    // Primary Colors
    primary: '#667eea',
    'primary-light': '#8E9EFB',
    'primary-dark': '#4856B7',
    'primary-hover': '#1e3a8a',

    // Secondary Colors
    secondary: '#764ba2',
    'secondary-light': '#9D73C9',
    'secondary-dark': '#55347B',
    'secondary-hover': '#1e3a8a',

    // Accent Colors
    accent: '#ff6b6b',
    'accent-light': '#ff8787',
    'accent-dark': '#fa5252',
    'accent-hover': '#f03e3e',

    // Semantic Colors
    success: '#38b000',
    'success-light': '#70e000',
    'success-dark': '#008000',
    'success-hover': '#007000',

    warning: '#fca311',
    'warning-light': '#ffb703',
    'warning-dark': '#e85d04',
    'warning-hover': '#d00000',

    error: '#d00000',
    'error-light': '#ff4d6d',
    'error-dark': '#800f2f',
    'error-hover': '#590d22',

    info: '#00b4d8',
    'info-light': '#90e0ef',
    'info-dark': '#0077b6',
    'info-hover': '#03045e',

    // Background Colors
    'bg-primary': '#f8fafc',
    'bg-secondary': '#f1f5f9',
    'bg-tertiary': '#e2e8f0',
    'bg-hover': 'rgba(0, 0, 0, 0.05)',
    'bg-overlay': 'rgba(0, 0, 0, 0.5)',

    // Surface Colors
    'surface-primary': '#ffffff',
    'surface-secondary': '#f8fafc',
    'surface-tertiary': '#f1f5f9',
    'surface-hover': '#f1f5f9',

    // Text Colors
    'text-primary': '#1e293b',
    'text-secondary': '#64748b',
    'text-tertiary': '#94a3b8',
    'text-disabled': '#cbd5e1',
    'text-inverse': '#ffffff',
    'text-accent': '#667eea',

    // Border Colors
    'border-primary': '#e2e8f0',
    'border-secondary': '#f1f5f9',
    'border-tertiary': '#f8fafc',
    'border-focus': '#6366f1',

    // Shadow Colors
    'shadow-light': 'rgba(0, 0, 0, 0.05)',
    'shadow-medium': 'rgba(0, 0, 0, 0.1)',
    'shadow-heavy': 'rgba(0, 0, 0, 0.2)',

    // Special Button Colors
    'auth-button-primary': '#667eea',
    'auth-button-hover': '#764ba2',
    'auth-button-shadow': 'rgba(102, 126, 234, 0.25)',
    'special-offer-button': '#667eea',
    'special-offer-button-hover': '#764ba2',
    'special-offer-button-shadow': 'rgba(102, 126, 234, 0.25)',

    // Modal Colors
    'modal-bg': '#ffffff',
    'modal-header-bg': '#f8fafc',
    'modal-border': '#e5e7eb',
    'input-bg': '#ffffff',
    'input-border': '#d1d5db',
    'input-focus-border': '#6366f1'
  },
  layout: {
    'container-max-width': '1200px',
    'container-padding': '0 20px',
    'grid-columns-desktop': 4,
    'grid-columns-tablet': 3,
    'grid-columns-mobile': 2,
    'grid-gap': '1.5rem',
    'cards-border-radius': '12px',
    'cards-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    'cards-padding': '1.5rem'
  },
  components: {
    // Typography
    'font-family-primary': "'Inter', sans-serif",
    'font-family-secondary': "'Inter', sans-serif",
    'font-family-mono': "'Fira Code', monospace",

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
    'line-height-normal': '1.5',
    'line-height-relaxed': '1.75',
    'line-height-loose': '2',

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
    'shadow-xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    'shadow-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    'shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    'shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    'shadow-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    'shadow-xxl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

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
    'transition-fast': '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    'transition-normal': '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    'transition-slow': '500ms cubic-bezier(0.4, 0, 0.2, 1)',

    // Auth Modal Variables
    'auth-modal-bg': '#ffffff',
    'auth-modal-shadow': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    'auth-modal-border': 'none',
    'auth-header-bg': '#f8fafc',
    'auth-header-border': '1px solid #e2e8f0',
    'auth-tab-inactive': '#64748b',
    'auth-tab-active': '#1e293b',
    'auth-tab-active-bg': '#f1f5f9',
    'auth-tab-hover': '#475569',
    'auth-tab-hover-bg': '#f8fafc',
    'auth-content-bg': '#ffffff',
    'auth-input-bg': '#ffffff',
    'auth-input-border': '1px solid #d1d5db',
    'auth-input-focus': '#6366f1',
    'auth-btn-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'auth-btn-secondary': '#f1f5f9',
    'auth-btn-secondary-text': '#475569',
    'auth-btn-secondary-border': '1px solid #e2e8f0',

    // Additional CSS variables for compatibility
    'color-text-tertiary': '#94a3b8',
    'color-text-primary': '#1e293b',
    'color-text-secondary': '#64748b',
    'color-text-inverse': '#ffffff',
    'color-primary': '#667eea',
    'color-surface-primary': '#ffffff',
    'color-surface-secondary': '#f8fafc',
    'color-border-primary': '#e2e8f0'
  }
};