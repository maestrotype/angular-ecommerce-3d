import { ThemeDefinition } from './theme.model';

const BASELINE_DIMENSIONS = [
  'appearance',
  'typography',
  'spacing',
  'radius',
  'elevation',
  'density',
  'motion',
  'layout',
] as const;

export const lightTheme: ThemeDefinition = {
  id: 'light',
  name: 'Light',
  description: 'Clean default storefront — semantic tokens from _default.scss',
  areas: ['frontend', 'admin'],
  scssSource: 'src/styles/themes/_default.scss',
  dimensions: [...BASELINE_DIMENSIONS],
  preview: {
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#f59e0b',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    glassBlur: '0',
  },
};

export const darkTheme: ThemeDefinition = {
  id: 'dark',
  name: 'Dark',
  description: 'Slate dark mode — semantic overrides in _dark.scss',
  areas: ['frontend', 'admin'],
  scssSource: 'src/styles/themes/_dark.scss',
  dimensions: ['appearance', 'elevation', 'motion', 'effects'],
  preview: {
    primary: '#60a5fa',
    secondary: '#475569',
    accent: '#f59e0b',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    glassBlur: '0',
  },
};

export const glassTheme: ThemeDefinition = {
  id: 'glass',
  name: 'Glass',
  description: 'Frosted glass storefront + admin chrome — _glass.scss + _admin-glass.scss',
  areas: ['frontend', 'admin'],
  scssSource: 'src/styles/themes/_glass.scss',
  dimensions: ['appearance', 'elevation', 'motion', 'effects', 'layout'],
  preview: {
    primary: '#6366f1',
    secondary: '#64748b',
    accent: '#818cf8',
    background: 'rgba(102, 126, 234, 0.15)',
    surface: 'rgba(255, 255, 255, 0.12)',
    text: '#1e293b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    glassBlur: '12px',
  },
};

export const darkGlassTheme: ThemeDefinition = {
  id: 'dark-glass',
  name: 'Dark Glass',
  description: 'Admin-only warm glass — _admin-dark-glass.scss',
  areas: ['admin'],
  scssSource: 'src/admin/styles/_admin-dark-glass.scss',
  dimensions: ['appearance', 'elevation', 'motion', 'effects', 'typography', 'layout'],
  preview: {
    primary: '#8ab4f8',
    secondary: '#9e9e9e',
    accent: '#ffcc80',
    background: 'rgba(90, 85, 80, 0.85)',
    surface: 'rgba(90, 85, 80, 0.7)',
    text: 'rgba(255, 255, 255, 0.95)',
    success: '#81c784',
    warning: '#ffb74d',
    error: '#f28b82',
    glassBlur: '16px',
  },
};
