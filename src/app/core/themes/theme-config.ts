import { Theme } from './theme.model';
import { defaultThemeNew } from './default-theme-new';
import { darkTheme } from './dark-theme';
import { glassTheme } from './glass-theme';

export const AVAILABLE_THEMES: Theme[] = [
  defaultThemeNew,
  darkTheme,
  glassTheme
];

export const DEFAULT_THEME_ID = 'default'; 