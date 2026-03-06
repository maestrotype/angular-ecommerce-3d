import { Theme } from './theme.model';
import { lightTheme } from './themes/light-theme';
import { darkTheme } from './themes/dark-theme';
import { glassTheme } from './themes/glass-theme';
import { darkGlassTheme } from './themes/dark-glass-theme';

export const AVAILABLE_THEMES: Theme[] = [
  lightTheme,
  darkTheme,
  glassTheme,
  darkGlassTheme
];

export const DEFAULT_THEME_ID = 'light'; 