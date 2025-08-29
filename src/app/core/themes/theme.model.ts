export interface ThemeColors {
  // Primary Colors
  primary: string;
  'primary-light': string;
  'primary-dark': string;
  'primary-hover': string;
  
  // Secondary Colors
  secondary: string;
  'secondary-light': string;
  'secondary-dark': string;
  'secondary-hover': string;
  
  // Accent Colors
  accent: string;
  'accent-light': string;
  'accent-dark': string;
  'accent-hover': string;
  
  // Semantic Colors
  success: string;
  'success-light': string;
  'success-dark': string;
  'success-hover': string;
  
  warning: string;
  'warning-light': string;
  'warning-dark': string;
  'warning-hover': string;
  
  error: string;
  'error-light': string;
  'error-dark': string;
  'error-hover': string;
  
  info: string;
  'info-light': string;
  'info-dark': string;
  'info-hover': string;
  
  // Background Colors
  'bg-primary': string;
  'bg-secondary': string;
  'bg-tertiary': string;
  'bg-hover': string;
  'bg-overlay': string;
  
  // Surface Colors
  'surface-primary': string;
  'surface-secondary': string;
  'surface-tertiary': string;
  'surface-hover': string;
  
  // Text Colors
  'text-primary': string;
  'text-secondary': string;
  'text-tertiary': string;
  'text-disabled': string;
  'text-inverse': string;
  'text-accent': string;
  
  // Border Colors
  'border-primary': string;
  'border-secondary': string;
  'border-tertiary': string;
  'border-focus': string;
  
  // Shadow Colors
  'shadow-light': string;
  'shadow-medium': string;
  'shadow-heavy': string;
  
  // Special Button Colors
  'auth-button-primary': string;
  'auth-button-hover': string;
  'auth-button-shadow': string;
  'special-offer-button': string;
  'special-offer-button-hover': string;
  'special-offer-button-shadow': string;
  
  // Modal Colors
  'modal-bg': string;
  'modal-header-bg': string;
  'modal-border': string;
  'input-bg': string;
  'input-border': string;
  'input-focus-border': string;
}

export interface ThemeLayout {
  // Container
  'container-max-width': string;
  'container-padding': string;
  
  // Grid
  'grid-columns-desktop': number;
  'grid-columns-tablet': number;
  'grid-columns-mobile': number;
  'grid-gap': string;
  
  // Cards
  'cards-border-radius': string;
  'cards-shadow': string;
  'cards-padding': string;
}

export interface ThemeComponents {
  // Typography
  'font-family-primary': string;
  'font-family-secondary': string;
  'font-family-mono': string;
  
  // Font Sizes
  'font-size-xs': string;
  'font-size-sm': string;
  'font-size-md': string;
  'font-size-lg': string;
  'font-size-xl': string;
  'font-size-xxl': string;
  'font-size-xxxl': string;
  
  // Font Weights
  'font-weight-light': string;
  'font-weight-normal': string;
  'font-weight-medium': string;
  'font-weight-semibold': string;
  'font-weight-bold': string;
  
  // Line Heights
  'line-height-tight': string;
  'line-height-normal': string;
  'line-height-relaxed': string;
  'line-height-loose': string;
  
  // Spacing
  'spacing-xs': string;
  'spacing-sm': string;
  'spacing-md': string;
  'spacing-lg': string;
  'spacing-xl': string;
  'spacing-xxl': string;
  'spacing-xxxl': string;
  
  // Border Radius
  'radius-xs': string;
  'radius-sm': string;
  'radius-md': string;
  'radius-lg': string;
  'radius-xl': string;
  'radius-xxl': string;
  'radius-full': string;
  
  // Shadows
  'shadow-xs': string;
  'shadow-sm': string;
  'shadow-md': string;
  'shadow-lg': string;
  'shadow-xl': string;
  'shadow-xxl': string;
  
  // Z-Index
  'z-index-dropdown': string;
  'z-index-sticky': string;
  'z-index-fixed': string;
  'z-index-modal-backdrop': string;
  'z-index-modal': string;
  'z-index-popover': string;
  'z-index-tooltip': string;
  'z-index-toast': string;
  
  // Transitions
  'transition-fast': string;
  'transition-normal': string;
  'transition-slow': string;
  
  // Auth Modal Variables
  'auth-modal-bg': string;
  'auth-modal-shadow': string;
  'auth-modal-border': string;
  'auth-header-bg': string;
  'auth-header-border': string;
  'auth-tab-inactive': string;
  'auth-tab-active': string;
  'auth-tab-active-bg': string;
  'auth-tab-hover': string;
  'auth-tab-hover-bg': string;
  'auth-content-bg': string;
  'auth-input-bg': string;
  'auth-input-border': string;
  'auth-input-focus': string;
  'auth-btn-primary': string;
  'auth-btn-secondary': string;
  'auth-btn-secondary-text': string;
  'auth-btn-secondary-border': string;
  
  // Additional CSS variables for compatibility
  'color-text-tertiary': string;
  'color-text-primary': string;
  'color-text-secondary': string;
  'color-text-inverse': string;
  'color-primary': string;
  'color-surface-primary': string;
  'color-surface-secondary': string;
  'color-border-primary': string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  layout: ThemeLayout;
  components: ThemeComponents;
} 