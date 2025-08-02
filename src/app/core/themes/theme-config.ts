import { Theme } from './theme.model';
import { defaultThemeNew } from './themes/default-theme-new';
import { darkTheme } from './themes/dark-theme';
import { glassTheme } from './themes/glass-theme';

export const AVAILABLE_THEMES: Theme[] = [
  defaultThemeNew,
  darkTheme,
  glassTheme
];

export const DEFAULT_THEME_ID = 'default'; 