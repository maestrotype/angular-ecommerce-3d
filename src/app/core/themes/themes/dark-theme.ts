import { Theme } from '../theme.model';

export const darkTheme: Theme = {
  id: 'dark',
  name: 'Dark',
  description: 'Dark theme with high contrast and modern aesthetics',
  colors: {
    // Primary Colors
    primary: '#6366f1',
    'primary-light': '#818cf8',
    'primary-dark': '#4f46e5',
    'primary-hover': '#4338ca',

    // Secondary Colors
    secondary: '#7c3aed',
    'secondary-light': '#8b5cf6',
    'secondary-dark': '#5b21b6',
    'secondary-hover': '#6d28d9',

    // Accent Colors
    accent: '#ec4899',
    'accent-light': '#f472b6',
    'accent-dark': '#be185d',
    'accent-hover': '#db2777',

    // Semantic Colors
    success: '#10b981',
    'success-light': '#34d399',
    'success-dark': '#059669',
    'success-hover': '#059669',

    warning: '#f59e0b',
    'warning-light': '#fbbf24',
    'warning-dark': '#d97706',
    'warning-hover': '#d97706',

    error: '#ef4444',
    'error-light': '#f87171',
    'error-dark': '#dc2626',
    'error-hover': '#dc2626',

    info: '#60a5fa',
    'info-light': '#93c5fd',
    'info-dark': '#3b82f6',
    'info-hover': '#3b82f6',

    // Background Colors
    'bg-primary': '#0f172a',
    'bg-secondary': '#1e293b',
    'bg-tertiary': '#334155',
    'bg-hover': '#1e40af',
    'bg-overlay': 'rgba(0, 0, 0, 0.7)',

    // Surface Colors
    'surface-primary': '#1e293b',
    'surface-secondary': '#334155',
    'surface-tertiary': '#475569',
    'surface-hover': '#3b82f6',

    // Text Colors
    'text-primary': '#f8fafc',
    'text-secondary': '#cbd5e1',
    'text-tertiary': '#94a3b8',
    'text-disabled': '#64748b',
    'text-inverse': '#0f172a',
    'text-accent': '#4f46e5',

    // Border Colors
    'border-primary': '#475569',
    'border-secondary': '#334155',
    'border-tertiary': '#1e293b',
    'border-focus': '#3b82f6',

    // Shadow Colors
    'shadow-light': 'rgba(0, 0, 0, 0.3)',
    'shadow-medium': 'rgba(0, 0, 0, 0.4)',
    'shadow-heavy': 'rgba(0, 0, 0, 0.6)',

    // Special Button Colors
    'auth-button-primary': '#6366f1',
    'auth-button-hover': '#4f46e5',
    'auth-button-shadow': 'rgba(99, 102, 241, 0.3)',
    'special-offer-button': '#6366f1',
    'special-offer-button-hover': '#4f46e5',
    'special-offer-button-shadow': 'rgba(99, 102, 241, 0.3)',

    // Modal Colors
    'modal-bg': '#1f2937',
    'modal-header-bg': '#111827',
    'modal-border': '#4b5563',
    'input-bg': '#374151',
    'input-border': '#6b7280',
    'input-focus-border': '#6366f1'
  },
  layout: {
    'container-max-width': '1200px',
    'container-padding': '0 20px',
    'grid-columns-desktop': 4,
    'grid-columns-tablet': 3,
    'grid-columns-mobile': 2,
    'grid-gap': '1rem',
    'cards-border-radius': '12px',
    'cards-shadow': '0 4px 12px rgba(0, 0, 0, 0.3)',
    'cards-padding': '1rem'
  },
  components: {
    // Typography
    'font-family-primary': "'Poppins', 'Segoe UI', sans-serif",
    'font-family-secondary': "'Nunito', 'Helvetica Neue', sans-serif",
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
    'shadow-xs': '0 1px 3px rgba(0, 0, 0, 0.3)',
    'shadow-sm': '0 2px 4px rgba(0, 0, 0, 0.3)',
    'shadow-md': '0 4px 8px rgba(0, 0, 0, 0.3)',
    'shadow-lg': '0 8px 16px rgba(0, 0, 0, 0.3)',
    'shadow-xl': '0 12px 24px rgba(0, 0, 0, 0.4)',
    'shadow-xxl': '0 16px 32px rgba(0, 0, 0, 0.5)',

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
    'auth-modal-bg': '#1f2937',
    'auth-modal-shadow': '0 20px 40px rgba(0, 0, 0, 0.5)',
    'auth-modal-border': '1px solid #4b5563',
    'auth-header-bg': '#111827',
    'auth-header-border': '1px solid #4b5563',
    'auth-tab-inactive': '#9ca3af',
    'auth-tab-active': '#ffffff',
    'auth-tab-active-bg': '#6366f1',
    'auth-tab-hover': '#f3f4f6',
    'auth-tab-hover-bg': '#374151',
    'auth-content-bg': '#1f2937',
    'auth-input-bg': '#374151',
    'auth-input-border': '1px solid #6b7280',
    'auth-input-focus': '#6366f1',
    'auth-btn-primary': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    'auth-btn-secondary': '#374151',
    'auth-btn-secondary-text': '#f3f4f6',
    'auth-btn-secondary-border': '1px solid #6b7280',

    // Additional CSS variables for compatibility
    'color-text-tertiary': '#9ca3af',
    'color-text-primary': '#f8fafc',
    'color-text-secondary': '#94a3b8',
    'color-text-inverse': '#ffffff',
    'color-primary': '#6366f1',
    'color-surface-primary': '#1f2937',
    'color-surface-secondary': '#374151',
    'color-border-primary': '#4b5563'
  }
}; 