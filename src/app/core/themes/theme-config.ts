import { Theme } from './theme.model';
import { liquidGlassTheme } from './themes/liquid-glass-theme';
import { defaultTheme } from './themes/default-theme';
import { modernTheme } from './themes/modern-theme';

export const AVAILABLE_THEMES: Theme[] = [
  liquidGlassTheme,
  defaultTheme,
  modernTheme
];

export const DEFAULT_THEME_ID = 'liquid-glass'; 