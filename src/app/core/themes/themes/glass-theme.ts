import { Theme } from '../theme.model';

export const glassTheme: Theme = {
  id: 'glass',
  name: 'Glass',
  description: 'Modern glass morphism design with vibrant gradients and blur effects',
  colors: {
    // Primary Colors
    primary: '#6366f1',
    'primary-light': '#818cf8',
    'primary-dark': '#4f46e5',
    'primary-hover': '#5b21b6',

    // Secondary Colors
    secondary: '#8b5cf6',
    'secondary-light': '#a78bfa',
    'secondary-dark': '#7c3aed',
    'secondary-hover': '#6d28d9',

    // Accent Colors
    accent: '#ec4899',
    'accent-light': '#f472b6',
    'accent-dark': '#db2777',
    'accent-hover': '#be185d',

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
    'bg-primary': 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)',
    'bg-secondary': 'rgba(255, 255, 255, 0.15)',
    'bg-tertiary': 'rgba(255, 255, 255, 0.08)',
    'bg-hover': 'rgba(255, 255, 255, 0.2)',
    'bg-overlay': 'rgba(0, 0, 0, 0.2)',

    // Surface Colors
    'surface-primary': 'rgba(255, 255, 255, 0.4)',
    'surface-secondary': 'rgba(255, 255, 255, 0.25)',
    'surface-tertiary': 'rgba(255, 255, 255, 0.1)',
    'surface-hover': 'rgba(255, 255, 255, 0.3)',

    // Text Colors
    'text-primary': '#1e293b',
    'text-secondary': '#475569',
    'text-tertiary': '#64748b',
    'text-disabled': 'rgba(255, 255, 255, 0.4)',
    'text-inverse': '#ffffff',
    'text-accent': '#667eea',

    // Border Colors
    'border-primary': 'rgba(255, 255, 255, 0.2)',
    'border-secondary': 'rgba(255, 255, 255, 0.15)',
    'border-tertiary': 'rgba(255, 255, 255, 0.05)',
    'border-focus': '#6366f1',

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

    // Modal Colors - removed duplicates, they are now in components
    'modal-bg': 'rgba(255,255,255,0.15)',
    'modal-header-bg': 'rgba(255,255,255,0.15)',
    'modal-border': 'rgba(255,255,255,0.2)',
    'input-bg': 'rgba(255,255,255,0.2)',
    'input-border': 'rgba(255,255,255,0.25)',
    'input-focus-border': '#6366f1'
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
    'font-family-primary': "'Montserrat', 'Segoe UI', sans-serif",
    'font-family-secondary': "'Raleway', 'Helvetica Neue', sans-serif",
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
    'transition-slow': '0.5s ease',

    // Auth Modal Variables
    'auth-modal-bg': 'rgba(102, 126, 234, 0.25)',
    'auth-modal-shadow': '0 20px 40px rgba(0, 0, 0, 0.15)',
    'auth-modal-border': '1px solid rgba(102, 126, 234, 0.3)',
    'auth-header-bg': 'rgba(102, 126, 234, 0.2)',
    'auth-header-border': '1px solid rgba(102, 126, 234, 0.25)',
    'auth-tab-inactive': '#475569',
    'auth-tab-active': '#1e293b',
    'auth-tab-active-bg': 'rgba(102, 126, 234, 0.3)',
    'auth-tab-hover': '#64748b',
    'auth-tab-hover-bg': 'rgba(102, 126, 234, 0.25)',
    'auth-content-bg': 'rgba(102, 126, 234, 0.2)',
    'auth-input-bg': 'rgba(102, 126, 234, 0.25)',
    'auth-input-border': '1px solid rgba(102, 126, 234, 0.3)',
    'auth-input-focus': '#6366f1',
    'auth-btn-primary': 'linear-gradient(135deg, rgba(102, 126, 234, 0.35) 0%, rgba(102, 126, 234, 0.45) 100%)',
    'auth-btn-secondary': 'rgba(102, 126, 234, 0.2)',
    'auth-btn-secondary-text': '#475569',
    'auth-btn-secondary-border': '1px solid rgba(102, 126, 234, 0.35)',

    // Additional CSS variables for compatibility
    'color-text-tertiary': '#64748b',
    'color-text-primary': '#1e293b',
    'color-text-secondary': '#475569',
    'color-text-inverse': '#ffffff',
    'color-primary': '#6366f1',
    'color-surface-primary': 'rgba(255, 255, 240, 0.3)', // Light warm glass
    'color-surface-secondary': 'rgba(255, 255, 255, 0.2)',
    'color-border-primary': 'rgba(255, 255, 255, 0.4)'
  }
}; 