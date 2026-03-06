import { Theme } from '../theme.model';

export const darkGlassTheme: Theme = {
    id: 'dark-glass',
    name: 'Dark Glass',
    description: 'Warm dark background with liquid glass effect',
    colors: {
        // Primary Colors
        primary: '#8ab4f8',
        'primary-light': '#aec7f9',
        'primary-dark': '#1a73e8',
        'primary-hover': '#1967d2',

        // Secondary Colors
        secondary: '#f8bbd0',
        'secondary-light': '#fce4ec',
        'secondary-dark': '#f06292',
        'secondary-hover': '#e91e63',

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

        // Background Colors - Matching _admin-dark-glass.scss
        'bg-primary': 'rgba(90, 85, 80, 0.7)',
        'bg-secondary': 'rgba(85, 80, 75, 0.45)',
        'bg-tertiary': 'rgba(80, 75, 70, 0.4)',
        'bg-hover': 'rgba(100, 95, 90, 0.5)',
        'bg-overlay': 'rgba(0, 0, 0, 0.4)',

        // Surface Colors
        'surface-primary': 'rgba(90, 85, 80, 0.7)',
        'surface-secondary': 'rgba(85, 80, 75, 0.45)',
        'surface-tertiary': 'rgba(80, 75, 70, 0.4)',
        'surface-hover': 'rgba(100, 95, 90, 0.5)',

        // Text Colors
        'text-primary': 'rgba(255, 255, 255, 0.95)',
        'text-secondary': 'rgba(255, 255, 255, 0.7)',
        'text-tertiary': 'rgba(255, 255, 255, 0.4)',
        'text-disabled': 'rgba(255, 255, 255, 0.3)',
        'text-inverse': '#1a1a1a',
        'text-accent': '#8ab4f8',

        // Border Colors
        'border-primary': 'rgba(255, 255, 255, 0.2)',
        'border-secondary': 'rgba(255, 255, 255, 0.15)',
        'border-tertiary': 'rgba(255, 255, 255, 0.1)',
        'border-focus': '#8ab4f8',

        // Shadow Colors
        'shadow-light': 'rgba(0, 0, 0, 0.3)',
        'shadow-medium': 'rgba(0, 0, 0, 0.4)',
        'shadow-heavy': 'rgba(0, 0, 0, 0.6)',

        // Special Button Colors
        'auth-button-primary': '#8ab4f8',
        'auth-button-hover': '#aec7f9',
        'auth-button-shadow': 'rgba(138, 180, 248, 0.3)',
        'special-offer-button': '#8ab4f8',
        'special-offer-button-hover': '#aec7f9',
        'special-offer-button-shadow': 'rgba(138, 180, 248, 0.3)',

        // Modal Colors
        'modal-bg': 'rgba(75, 70, 65, 0.85)',
        'modal-header-bg': 'rgba(65, 60, 55, 0.9)',
        'modal-border': 'rgba(255, 255, 255, 0.15)',
        'input-bg': 'rgba(90, 85, 80, 0.7)',
        'input-border': 'rgba(255, 255, 255, 0.2)',
        'input-focus-border': '#8ab4f8'
    },
    layout: {
        'container-max-width': '1200px',
        'container-padding': '0 20px',
        'grid-columns-desktop': 4,
        'grid-columns-tablet': 3,
        'grid-columns-mobile': 2,
        'grid-gap': '1rem',
        'cards-border-radius': '28px',
        'cards-shadow': '0 10px 30px rgba(0, 0, 0, 0.45)',
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
        'radius-md': '12px',
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
        'auth-modal-bg': 'rgba(75, 70, 65, 0.85)',
        'auth-modal-shadow': '0 20px 40px rgba(0, 0, 0, 0.5)',
        'auth-modal-border': '1px solid rgba(255, 255, 255, 0.15)',
        'auth-header-bg': 'rgba(65, 60, 55, 0.9)',
        'auth-header-border': '1px solid rgba(255, 255, 255, 0.15)',
        'auth-tab-inactive': 'rgba(255, 255, 255, 0.5)',
        'auth-tab-active': 'rgba(255, 255, 255, 0.95)',
        'auth-tab-active-bg': 'rgba(138, 180, 248, 0.2)',
        'auth-tab-hover': 'rgba(255, 255, 255, 0.8)',
        'auth-tab-hover-bg': 'rgba(255, 255, 255, 0.1)',
        'auth-content-bg': 'transparent',
        'auth-input-bg': 'rgba(90, 85, 80, 0.7)',
        'auth-input-border': '1px solid rgba(255, 255, 255, 0.2)',
        'auth-input-focus': '#8ab4f8',
        'auth-btn-primary': 'linear-gradient(135deg, #8ab4f8 0%, #aec7f9 100%)',
        'auth-btn-secondary': 'rgba(255, 255, 255, 0.1)',
        'auth-btn-secondary-text': 'rgba(255, 255, 255, 0.9)',
        'auth-btn-secondary-border': '1px solid rgba(255, 255, 255, 0.2)',

        // Additional CSS variables for compatibility
        'color-text-tertiary': 'rgba(255, 255, 255, 0.4)',
        'color-text-primary': 'rgba(255, 255, 255, 0.95)',
        'color-text-secondary': 'rgba(255, 255, 255, 0.7)',
        'color-text-inverse': '#1a1a1a',
        'color-primary': '#8ab4f8',
        'color-surface-primary': 'rgba(90, 85, 80, 0.7)',
        'color-surface-secondary': 'rgba(85, 80, 75, 0.45)',
        'color-border-primary': 'rgba(255, 255, 255, 0.2)'
    }
};
