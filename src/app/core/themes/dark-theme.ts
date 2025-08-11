import { Theme } from './theme.model';

export const darkTheme: Theme = {
  id: 'dark',
  name: 'Dark',
  description: 'Dark theme with high contrast and modern aesthetics',
  colors: {
    // Primary Colors
    primary: '#4f46e5',
    'primary-light': '#6366f1',
    'primary-dark': '#3730a3',
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
    success: '#4caf50',
    'success-light': '#66bb6a',
    'success-dark': '#388e3c',
    'success-hover': '#059669',
    
    warning: '#ff9800',
    'warning-light': '#ffb74d',
    'warning-dark': '#f57c00',
    'warning-hover': '#d97706',
    
    error: '#f44336',
    'error-light': '#ef5350',
    'error-dark': '#d32f2f',
    'error-hover': '#dc2626',
    
    info: '#3b82f6',
    'info-light': '#60a5fa',
    'info-dark': '#1976d2',
    'info-hover': '#2563eb',
    
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
    'modal-bg': '#1e293b',
    'modal-header-bg': '#334155',
    'modal-border': '#475569',
    'input-bg': '#334155',
    'input-border': '#475569',
    'input-focus-border': '#6366f1',
    
    // Data Table Colors
    'table-bg': '#2d2d2d',
    'table-border': '#404040',
    'table-header-bg': '#374151',
    'table-header-text': '#ffffff',
    'table-row-bg': '#2d2d2d',
    'table-row-text': '#ffffff',
    'table-row-hover': '#374151',
    'status-badge-bg': '#374151',
    'status-badge-text': '#ffffff',
    'status-pending': '#ff9800',
    'status-success': '#4caf50',
    'status-error': '#f44336',
    'status-warning': '#ff9800',
    'status-info': '#2196f3',
    'action-button-color': '#f44336',
    'action-button-hover': 'rgba(244, 67, 54, 0.1)',
    'user-avatar-bg': '#374151',
    'user-avatar-icon': '#9ca3af',
    'user-name-color': '#ffffff',
    'user-phone-color': '#9ca3af',
    'no-data-text': '#ffffff',
    'no-data-icon': '#9ca3af',
    'no-data-title': '#ffffff',
    'no-data-description': '#9ca3af',
    'paginator-bg': '#2d2d2d',
    'paginator-text': '#ffffff',
    'paginator-border': '#404040',
    'paginator-disabled': '#6b7280',
    'paginator-arrow': '#9ca3af',
    'paginator-dropdown-bg': '#2d2d2d',
    'paginator-dropdown-hover': '#374151',
    'paginator-dropdown-active': '#3b82f6',
    'chip-bg': '#4b5563',
    'chip-text': '#ffffff',
    'chip-selected-bg': '#3b82f6',
    'chip-primary-bg': '#3b82f6',
    'chip-warn-bg': '#f44336',
    'chip-accent-bg': '#ff9800',
    'icon-button-color': '#f44336',
    'icon-button-hover': 'rgba(244, 67, 54, 0.1)',
    'icon-button-disabled': '#6b7280',
    'icon-button-primary': '#3b82f6',
    'icon-button-primary-hover': 'rgba(59, 130, 246, 0.1)',
    'icon-button-warn': '#f44336',
    'icon-button-warn-hover': 'rgba(244, 67, 54, 0.1)',
    'form-label-color': '#e5e7eb',
    'form-input-color': '#ffffff',
    'form-outline-color': '#6b7280',
    'form-focus-color': '#3b82f6',
    // Search component colors
    'search-bg': '#374151',
    'search-border': '#4b5563',
    'search-text': '#ffffff',
    'search-placeholder': '#9ca3af',
    'search-icon': '#9ca3af',
    'search-focus-border': '#3b82f6',
    'search-focus-bg': '#374151',
    'search-button-bg': '#ec4899',
    'search-button-text': '#ffffff',
    'search-button-hover-bg': '#db2777',
    'search-dropdown-bg': '#1f2937',
    'search-dropdown-border': '#374151',
    'search-dropdown-text': '#d1d5db',
    'search-dropdown-hover-bg': '#374151',
    
    // Two-layer background system
    'admin-content-outer-bg': '#303030', // Outer layer (admin-main)
    'admin-content-inner-bg': '#1f2937', // Inner layer (message-list-container, etc.)
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
    'transition-slow': '0.5s ease'
  }
}; 